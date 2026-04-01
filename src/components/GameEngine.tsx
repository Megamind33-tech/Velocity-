import React, { useEffect, useRef, useState } from 'react';
import { AudioController } from '../lib/audio';
import { Song, SONGS } from '../lib/songs-extended';
import { LEVEL_CHALLENGES, getLevelInfo } from '../lib/progression';

interface GameEngineProps {
  audioController: AudioController;
  song: Song | null;
  level: number; // 1-20
  mode: 'A' | 'C'; // Mode A = waypoints, Mode C = contour
  difficulty: 'novice' | 'intermediate' | 'advanced' | 'master' | 'legend';
  isPaused: boolean;
  onGameOver: (score: number, win: boolean, stats: GameStats) => void;
}

export interface GameStats {
  accuracy: number;
  maxCombo: number;
  notesHit: number;
  notesMissed: number;
  smoothnessScore: number;
  vibratoQuality: number;
  playtime: number;
}

// ============================================================
// REALISTIC PLANE GRAPHICS & FLIGHT MECHANICS
// ============================================================

const PlaneGraphics = {
  // Cessna-172 style aircraft
  drawPlane: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    altitude: number,
    pitchAngle: number,
    isAccurate: boolean
  ) => {
    ctx.save();
    ctx.translate(x, y);

    // Plane body color (glow on correct hits)
    const glowColor = isAccurate
      ? 'rgba(67, 231, 255, 0.8)'  // Cyan glow
      : 'rgba(200, 200, 200, 0.6)'; // Gray

    // Fuselage (body)
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 8, pitchAngle * (Math.PI / 180), 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = '#E8E8E8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 70, 4, pitchAngle * (Math.PI / 180), 0, Math.PI * 2);
    ctx.fill();

    // Cockpit window
    ctx.fillStyle = '#0047AB';
    ctx.beginPath();
    ctx.arc(8, -4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 45, 12, pitchAngle * (Math.PI / 180), 0, Math.PI * 2);
    ctx.stroke();

    // Tail rudder
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.moveTo(-35, 0);
    ctx.lineTo(-40, -8);
    ctx.lineTo(-40, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  // Flight HUD overlay
  drawHUD: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    altitude: number,
    pitch: number,
    accuracy: number,
    score: number,
    elapsedTime: number,
    totalTime: number
  ) => {
    const padding = 15;
    const hudColor = '#43E7FF';
    const textColor = '#F5F7FC';

    // Top-left: Altitude/Pitch display
    ctx.fillStyle = textColor;
    ctx.font = 'bold 14px "Space Grotesk"';
    ctx.textAlign = 'left';

    const noteNum = 12 * Math.log2(pitch / 440) + 69;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = noteNames[Math.round(noteNum) % 12];
    const octave = Math.floor(Math.round(noteNum) / 12);

    // Altitude indicator
    ctx.fillText(`ALT: ${noteName}${octave}`, padding, padding + 20);
    ctx.fillText(`PITCH: ${pitch.toFixed(1)} Hz`, padding, padding + 40);

    // Top-right: Accuracy display
    ctx.textAlign = 'right';
    ctx.fillText(`ACCURACY: ${accuracy.toFixed(1)}%`, width - padding, padding + 20);
    ctx.fillText(`SCORE: ${score}`, width - padding, padding + 40);

    // Bottom-left: Time display
    ctx.textAlign = 'left';
    const timeRemaining = Math.max(0, totalTime - elapsedTime);
    ctx.fillText(`TIME: ${elapsedTime.toFixed(1)}s / ${totalTime.toFixed(1)}s`, padding, height - padding);

    // Bottom-right: Status indicator
    ctx.textAlign = 'right';
    ctx.fillStyle = accuracy > 85 ? '#B9FF66' : accuracy > 60 ? '#FFC94A' : '#FF6B6B';
    ctx.fillText(accuracy > 85 ? 'ON COURSE' : accuracy > 60 ? 'ADJUSTING' : 'OFF COURSE', width - padding, height - padding);
  },

  // Altitude reference grid
  drawAltitudeGrid: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    minNote: number,
    maxNote: number
  ) => {
    const noteRange = maxNote - minNote;

    ctx.strokeStyle = 'rgba(67, 231, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.font = '10px "Inter"';
    ctx.fillStyle = 'rgba(184, 191, 212, 0.3)';
    ctx.textAlign = 'right';

    // Draw horizontal grid lines for each semitone
    for (let i = 0; i <= noteRange; i += 2) { // Every 2 semitones
      const y = height - ((i / noteRange) * height);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      const noteNum = minNote + i;
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const noteName = noteNames[noteNum % 12];
      const octave = Math.floor(noteNum / 12);

      ctx.fillText(`${noteName}${octave}`, width - 5, y + 3);
    }
  },
};

// ============================================================
// MODE A: WAYPOINT FLYING ENGINE
// ============================================================

interface WaypointData {
  noteNum: number;
  time: number;
  duration: number;
  x: number; // Screen position
  y: number;
  visible: boolean;
  hitAccuracy?: number;
  passed: boolean;
}

const ModeAEngine = {
  generateWaypoints: (
    song: Song,
    noteSequence: number[],
    level: number,
    canvasWidth: number,
    canvasHeight: number
  ): WaypointData[] => {
    const levelInfo = getLevelInfo(level);
    const tempo = levelInfo?.tempo || 100;
    const songDuration = song.duration;
    const minNote = song.minNote;
    const maxNote = song.maxNote;
    const noteRange = maxNote - minNote;

    const waypoints: WaypointData[] = noteSequence.map((noteNum, index) => {
      const timeFraction = index / noteSequence.length;
      const time = timeFraction * songDuration;
      const duration = (songDuration / noteSequence.length) * (tempo / 100);
      const x = (timeFraction) * canvasWidth;
      const y = canvasHeight - ((noteNum - minNote) / noteRange) * canvasHeight;

      return {
        noteNum,
        time,
        duration,
        x,
        y,
        visible: false,
        passed: false,
      };
    });

    return waypoints;
  },

  updateWaypoints: (
    waypoints: WaypointData[],
    elapsedTime: number,
    lookAheadTime: number = 2 // seconds
  ) => {
    waypoints.forEach(wp => {
      wp.visible = elapsedTime >= wp.time - lookAheadTime && elapsedTime <= wp.time + wp.duration;
    });
  },

  checkWaypointHit: (
    currentPitch: number,
    targetNote: number,
    hitZones: number
  ): { hit: boolean; accuracy: number } => {
    const currentNote = 12 * Math.log2(currentPitch / 440) + 69;
    const difference = Math.abs(currentNote - targetNote);
    const hit = difference <= hitZones;
    const accuracy = Math.max(0, 100 - (difference * 100 / hitZones));

    return { hit, accuracy };
  },
};

// ============================================================
// MODE C: MELODIC CONTOUR ENGINE
// ============================================================

interface ContourData {
  points: { x: number; y: number; noteNum: number }[];
  smooth: boolean;
}

const ModeCEngine = {
  generateContour: (
    song: Song,
    noteSequence: number[],
    canvasWidth: number,
    canvasHeight: number
  ): ContourData => {
    const minNote = song.minNote;
    const maxNote = song.maxNote;
    const noteRange = maxNote - minNote;
    const songDuration = song.duration;

    const points = noteSequence.map((noteNum, index) => {
      const timeFraction = index / noteSequence.length;
      const x = timeFraction * canvasWidth;
      const y = canvasHeight - ((noteNum - minNote) / noteRange) * canvasHeight;

      return { x, y, noteNum };
    });

    return { points, smooth: true };
  },

  drawContour: (
    ctx: CanvasRenderingContext2D,
    contour: ContourData,
    color: string = '#7D5CFF'
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (contour.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(contour.points[0].x, contour.points[0].y);

      for (let i = 1; i < contour.points.length; i++) {
        ctx.lineTo(contour.points[i].x, contour.points[i].y);
      }

      ctx.stroke();
    }
  },

  calculateContourAccuracy: (
    playerPitch: number,
    targetContour: { points: { x: number; y: number; noteNum: number }[] },
    elapsedTime: number,
    totalTime: number,
    hitZones: number
  ): number => {
    const currentX = (elapsedTime / totalTime) * (targetContour.points[targetContour.points.length - 1]?.x || 100);

    // Find nearest point on contour
    let nearestPoint = targetContour.points[0];
    let minDistance = Infinity;

    targetContour.points.forEach(point => {
      const distance = Math.abs(point.x - currentX);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    });

    const currentNote = 12 * Math.log2(playerPitch / 440) + 69;
    const difference = Math.abs(currentNote - nearestPoint.noteNum);
    const accuracy = Math.max(0, 100 - (difference * 100 / hitZones));

    return accuracy;
  },
};

// ============================================================
// MAIN GAME ENGINE COMPONENT
// ============================================================

export function GameEngine({
  audioController,
  song,
  level,
  mode,
  difficulty,
  isPaused,
  onGameOver,
}: GameEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    accuracy: 0,
    maxCombo: 0,
    notesHit: 0,
    notesMissed: 0,
    smoothnessScore: 100,
    vibratoQuality: 0,
    playtime: 0,
  });

  const gameStateRef = useRef({
    elapsedTime: 0,
    started: false,
    ended: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    accuracySum: 0,
    hitCount: 0,
    totalCount: 0,
    waypoints: [] as WaypointData[],
    lastPitch: 440,
    pitchHistory: [] as number[],
  });

  useEffect(() => {
    if (!canvasRef.current || !song || !audioController.isSinging) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animationFrameRef = { id: 0 };
    let lastFrameTime = Date.now();

    const animate = () => {
      if (isPaused) {
        animationFrameRef.id = requestAnimationFrame(animate);
        return;
      }

      const now = Date.now();
      const deltaTime = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      const state = gameStateRef.current;
      if (!state.ended) {
        state.elapsedTime += deltaTime;
      }

      // Get current pitch from audio controller
      const currentPitch = audioController.pitch > 0 ? audioController.pitch : 440;
      state.lastPitch = currentPitch;
      state.pitchHistory.push(currentPitch);

      // Clear canvas
      ctx.fillStyle = '#07090E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw altitude grid
      PlaneGraphics.drawAltitudeGrid(ctx, canvas.width, canvas.height, song.minNote, song.maxNote);

      // Render based on mode
      if (mode === 'A') {
        // MODE A: Draw waypoints
        if (state.waypoints.length === 0) {
          // TODO: Generate waypoints from song
        }
      } else if (mode === 'C') {
        // MODE C: Draw contour
        const levelInfo = getLevelInfo(level);
        const contour = ModeCEngine.generateContour(song, [], canvas.width, canvas.height);
        ModeCEngine.drawContour(ctx, contour, '#7D5CFF');
      }

      // Draw plane
      const noteNum = 12 * Math.log2(currentPitch / 440) + 69;
      const normalizedY = (noteNum - song.minNote) / (song.maxNote - song.minNote);
      const planeY = canvas.height - normalizedY * canvas.height;
      const isAccurate = Math.abs(normalizedY * 100 - 50) < 20; // Simple accuracy check

      PlaneGraphics.drawPlane(ctx, 60, planeY, normalizedY * 100, 0, isAccurate);

      // Draw HUD
      PlaneGraphics.drawHUD(
        ctx,
        canvas.width,
        canvas.height,
        noteNum,
        currentPitch,
        gameStats.accuracy,
        state.score,
        state.elapsedTime,
        song.duration
      );

      // Check for game end
      if (state.elapsedTime >= song.duration) {
        state.ended = true;
        const finalAccuracy = state.hitCount > 0 ? (state.accuracySum / state.hitCount) : 0;
        onGameOver(state.score, finalAccuracy > 75, {
          accuracy: finalAccuracy,
          maxCombo: state.maxCombo,
          notesHit: state.hitCount,
          notesMissed: state.totalCount - state.hitCount,
          smoothnessScore: 85,
          vibratoQuality: 0,
          playtime: state.elapsedTime,
        });
        return;
      }

      animationFrameRef.id = requestAnimationFrame(animate);
    };

    animationFrameRef.id = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameRef.id);
  }, [audioController, song, level, mode, isPaused, onGameOver, gameStats.accuracy]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{ display: 'block', background: '#07090E' }}
    />
  );
}

export default GameEngine;
