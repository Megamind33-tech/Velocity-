import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AudioController } from '../lib/audio';
import { Song } from '../lib/songs-extended';
import { LEVEL_CHALLENGES, getLevelInfo } from '../lib/progression';

interface GameEngineProps {
  audioController: AudioController;
  song: Song | null;
  level: number;
  mode: 'A' | 'C';
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

interface WaypointData {
  noteNum: number;
  time: number;
  duration: number;
  x: number;
  y: number;
  visible: boolean;
  hitAccuracy: number;
  passed: boolean;
  hit: boolean;
}

interface ContourPoint {
  x: number;
  y: number;
  noteNum: number;
  time: number;
}

function generateNoteSequence(song: Song, level: number): number[] {
  const { minNote, maxNote, bpm, duration } = song;
  const noteRange = maxNote - minNote;
  const levelInfo = getLevelInfo(level);
  const tempo = levelInfo?.tempo || 100;

  const beatsPerSecond = (bpm * (tempo / 100)) / 60;
  const totalBeats = Math.floor(beatsPerSecond * duration);
  const noteCount = Math.max(8, Math.min(totalBeats, Math.floor(duration / 1.5)));

  const notes: number[] = [];
  const keyNote = minNote + Math.floor(noteRange / 2);

  const scaleSteps = [0, 2, 4, 5, 7, 9, 11];
  const baseScaleNotes: number[] = [];
  for (let oct = -1; oct <= 2; oct++) {
    for (const step of scaleSteps) {
      const note = keyNote + step + (oct * 12);
      if (note >= minNote && note <= maxNote) {
        baseScaleNotes.push(note);
      }
    }
  }

  if (baseScaleNotes.length === 0) {
    for (let n = minNote; n <= maxNote; n++) baseScaleNotes.push(n);
  }

  let seed = song.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + level * 137;
  const seededRandom = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed % 1000) / 1000;
  };

  let currentIdx = Math.floor(baseScaleNotes.length / 2);
  for (let i = 0; i < noteCount; i++) {
    notes.push(baseScaleNotes[currentIdx]);
    const jump = Math.floor(seededRandom() * 5) - 2;
    currentIdx = Math.max(0, Math.min(baseScaleNotes.length - 1, currentIdx + jump));
  }

  return notes;
}

function generateWaypoints(
  song: Song,
  noteSequence: number[],
  level: number,
  canvasWidth: number,
  canvasHeight: number
): WaypointData[] {
  const songDuration = song.duration;
  const minNote = song.minNote;
  const maxNote = song.maxNote;
  const noteRange = maxNote - minNote || 1;

  return noteSequence.map((noteNum, index) => {
    const timeFraction = (index + 0.5) / noteSequence.length;
    const time = timeFraction * songDuration;
    const duration = (songDuration / noteSequence.length) * 0.8;
    const x = timeFraction * canvasWidth;
    const y = canvasHeight - ((noteNum - minNote) / noteRange) * (canvasHeight * 0.8) - canvasHeight * 0.1;

    return {
      noteNum,
      time,
      duration,
      x,
      y,
      visible: false,
      hitAccuracy: 0,
      passed: false,
      hit: false,
    };
  });
}

function generateContourPoints(
  song: Song,
  noteSequence: number[],
  canvasWidth: number,
  canvasHeight: number
): ContourPoint[] {
  const minNote = song.minNote;
  const maxNote = song.maxNote;
  const noteRange = maxNote - minNote || 1;
  const songDuration = song.duration;

  return noteSequence.map((noteNum, index) => {
    const timeFraction = (index + 0.5) / noteSequence.length;
    const x = timeFraction * canvasWidth;
    const y = canvasHeight - ((noteNum - minNote) / noteRange) * (canvasHeight * 0.8) - canvasHeight * 0.1;
    return { x, y, noteNum, time: timeFraction * songDuration };
  });
}

const PlaneGraphics = {
  drawPlane: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pitchAngle: number,
    isAccurate: boolean
  ) => {
    ctx.save();
    ctx.translate(x, y);
    const angle = pitchAngle * (Math.PI / 180);

    const glowColor = isAccurate
      ? 'rgba(67, 231, 255, 0.8)'
      : 'rgba(200, 200, 200, 0.6)';

    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 8, angle, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E8E8E8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 70, 4, angle, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0047AB';
    ctx.beginPath();
    ctx.arc(8, -4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 45, 12, angle, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.moveTo(-35, 0);
    ctx.lineTo(-40, -8);
    ctx.lineTo(-40, 8);
    ctx.closePath();
    ctx.fill();

    if (isAccurate) {
      ctx.fillStyle = 'rgba(67, 231, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  drawHUD: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pitch: number,
    accuracy: number,
    score: number,
    combo: number,
    elapsedTime: number,
    totalTime: number,
    isSinging: boolean
  ) => {
    const padding = 15;
    const textColor = '#F5F7FC';

    ctx.fillStyle = textColor;
    ctx.font = 'bold 14px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';

    if (pitch > 0 && isSinging) {
      const noteNum = 12 * Math.log2(pitch / 440) + 69;
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const noteName = noteNames[Math.round(noteNum) % 12];
      const octave = Math.floor(Math.round(noteNum) / 12);
      ctx.fillText(`NOTE: ${noteName}${octave}`, padding, padding + 20);
      ctx.fillText(`PITCH: ${pitch.toFixed(1)} Hz`, padding, padding + 40);
    } else {
      ctx.fillStyle = '#4A5068';
      ctx.fillText('NOTE: --', padding, padding + 20);
      ctx.fillText('PITCH: --', padding, padding + 40);
      ctx.fillStyle = textColor;
    }

    ctx.textAlign = 'right';
    ctx.fillText(`ACCURACY: ${accuracy.toFixed(1)}%`, width - padding, padding + 20);
    ctx.fillText(`SCORE: ${score.toLocaleString()}`, width - padding, padding + 40);

    if (combo > 1) {
      ctx.fillStyle = combo >= 10 ? '#FFC94A' : '#B9FF66';
      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      ctx.fillText(`${combo}x COMBO`, width - padding, padding + 60);
    }

    ctx.fillStyle = textColor;
    ctx.font = 'bold 14px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    const timeRemaining = Math.max(0, totalTime - elapsedTime);
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = Math.floor(timeRemaining % 60);
    ctx.fillText(`TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`, padding, height - padding);

    const progressWidth = width - padding * 2;
    const progressY = height - padding - 20;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(padding, progressY, progressWidth, 4);
    const pct = Math.min(1, elapsedTime / totalTime);
    ctx.fillStyle = 'rgba(67,231,255,0.8)';
    ctx.fillRect(padding, progressY, progressWidth * pct, 4);

    ctx.textAlign = 'right';
    ctx.fillStyle = accuracy > 85 ? '#B9FF66' : accuracy > 60 ? '#FFC94A' : '#FF6B6B';
    ctx.fillText(accuracy > 85 ? 'ON COURSE' : accuracy > 60 ? 'ADJUSTING' : 'OFF COURSE', width - padding, height - padding);
  },

  drawAltitudeGrid: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    minNote: number,
    maxNote: number
  ) => {
    const noteRange = maxNote - minNote || 1;
    ctx.strokeStyle = 'rgba(67, 231, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.font = '10px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(184, 191, 212, 0.25)';
    ctx.textAlign = 'right';

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    for (let i = 0; i <= noteRange; i += 2) {
      const y = height - ((i / noteRange) * (height * 0.8)) - height * 0.1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      const noteNum = minNote + i;
      const noteName = noteNames[noteNum % 12];
      const octave = Math.floor(noteNum / 12);
      ctx.fillText(`${noteName}${octave}`, width - 5, y + 3);
    }
  },
};

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
  const gameStateRef = useRef({
    initialized: false,
    elapsedTime: 0,
    started: false,
    ended: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    accuracySum: 0,
    hitCount: 0,
    missCount: 0,
    totalChecked: 0,
    lastPitch: 0,
    pitchHistory: [] as number[],
    waypoints: [] as WaypointData[],
    contourPoints: [] as ContourPoint[],
    noteSequence: [] as number[],
    playerTrail: [] as { x: number; y: number; alpha: number }[],
    lastFrameTime: 0,
  });

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const initializeGame = useCallback(() => {
    if (!song || !canvasRef.current) return;
    const state = gameStateRef.current;
    if (state.initialized) return;

    const canvas = canvasRef.current;
    state.noteSequence = generateNoteSequence(song, level);

    if (mode === 'A') {
      state.waypoints = generateWaypoints(song, state.noteSequence, level, canvas.width, canvas.height);
    } else {
      state.contourPoints = generateContourPoints(song, state.noteSequence, canvas.width, canvas.height);
    }

    state.initialized = true;
    state.lastFrameTime = Date.now();
  }, [song, level, mode]);

  useEffect(() => {
    if (!canvasRef.current || !song) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    initializeGame();

    const state = gameStateRef.current;
    let animFrameId = 0;

    const animate = () => {
      if (!ctx || !song) return;

      const now = Date.now();
      if (state.lastFrameTime === 0) state.lastFrameTime = now;
      const deltaTime = Math.min((now - state.lastFrameTime) / 1000, 0.1);
      state.lastFrameTime = now;

      if (!isPaused && !state.ended) {
        state.elapsedTime += deltaTime;
      }

      audioController.update();
      const currentPitch = audioController.pitch;
      const isSinging = audioController.isSinging;
      if (isSinging && currentPitch > 0) {
        state.lastPitch = currentPitch;
        state.pitchHistory.push(currentPitch);
        if (state.pitchHistory.length > 100) state.pitchHistory.shift();
      }

      ctx.fillStyle = '#07090E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      PlaneGraphics.drawAltitudeGrid(ctx, canvas.width, canvas.height, song.minNote, song.maxNote);

      const levelInfo = getLevelInfo(level);
      const hitZones = levelInfo?.hitZones ?? 2;

      let planeY = canvas.height / 2;
      let isAccurate = false;
      let pitchAngle = 0;
      const noteRange = (song.maxNote - song.minNote) || 1;

      if (isSinging && currentPitch > 0) {
        const currentNoteNum = 12 * Math.log2(currentPitch / 440) + 69;
        const normalizedY = (currentNoteNum - song.minNote) / noteRange;
        planeY = canvas.height - normalizedY * (canvas.height * 0.8) - canvas.height * 0.1;
        planeY = Math.max(20, Math.min(canvas.height - 20, planeY));

        if (state.pitchHistory.length >= 2) {
          const prev = state.pitchHistory[state.pitchHistory.length - 2];
          pitchAngle = Math.max(-15, Math.min(15, (currentPitch - prev) * 0.5));
        }

        if (mode === 'A' && !isPaused) {
          for (const wp of state.waypoints) {
            if (wp.passed || wp.hit) continue;
            if (state.elapsedTime >= wp.time && state.elapsedTime <= wp.time + wp.duration) {
              const diff = Math.abs(currentNoteNum - wp.noteNum);
              if (diff <= hitZones) {
                const acc = Math.max(0, 100 - (diff * 100 / hitZones));
                wp.hit = true;
                wp.hitAccuracy = acc;
                state.hitCount++;
                state.accuracySum += acc;
                state.combo++;
                state.maxCombo = Math.max(state.maxCombo, state.combo);

                const comboMultiplier = 1 + Math.floor(state.combo / 5) * 0.25;
                const basePoints = Math.floor(acc * 10);
                state.score += Math.floor(basePoints * comboMultiplier);
                isAccurate = true;
              }
            }
          }

          for (const wp of state.waypoints) {
            if (!wp.passed && !wp.hit && state.elapsedTime > wp.time + wp.duration) {
              wp.passed = true;
              state.missCount++;
              state.combo = 0;
            }
          }
        }

        if (mode === 'C' && !isPaused && state.contourPoints.length > 0) {
          const currentTime = state.elapsedTime;
          let nearestPoint = state.contourPoints[0];
          let minTimeDist = Infinity;
          for (const pt of state.contourPoints) {
            const d = Math.abs(pt.time - currentTime);
            if (d < minTimeDist) {
              minTimeDist = d;
              nearestPoint = pt;
            }
          }
          const diff = Math.abs(currentNoteNum - nearestPoint.noteNum);
          if (diff <= hitZones) {
            const acc = Math.max(0, 100 - (diff * 100 / hitZones));
            state.hitCount++;
            state.accuracySum += acc;
            state.combo++;
            state.maxCombo = Math.max(state.maxCombo, state.combo);
            const comboMultiplier = 1 + Math.floor(state.combo / 5) * 0.25;
            state.score += Math.floor(acc * 0.5 * comboMultiplier);
            isAccurate = true;
          } else if (diff > hitZones * 2) {
            state.missCount++;
            state.combo = 0;
          }
          state.totalChecked++;
        }
      } else if (!isPaused && !state.ended) {
        if (mode === 'A') {
          for (const wp of state.waypoints) {
            if (!wp.passed && !wp.hit && state.elapsedTime > wp.time + wp.duration) {
              wp.passed = true;
              state.missCount++;
              state.combo = 0;
            }
          }
        } else if (mode === 'C') {
          state.combo = 0;
        }
      }

      if (mode === 'A') {
        const lookAheadSec = 4;
        const pixelsPerSecond = canvas.width / song.duration;
        const scrollOffset = state.elapsedTime * pixelsPerSecond;

        for (const wp of state.waypoints) {
          const wpScreenX = wp.x - scrollOffset + 80;
          if (wpScreenX < -50 || wpScreenX > canvas.width + 50) continue;

          const isInRange = state.elapsedTime >= wp.time - lookAheadSec && state.elapsedTime <= wp.time + wp.duration + 1;
          if (!isInRange) continue;

          let color = 'rgba(125, 92, 255, 0.6)';
          let radius = 14;
          if (wp.hit) {
            color = `rgba(185, 255, 102, ${0.4 + wp.hitAccuracy / 250})`;
            radius = 16;
          } else if (wp.passed) {
            color = 'rgba(255, 107, 107, 0.3)';
            radius = 10;
          } else if (state.elapsedTime >= wp.time && state.elapsedTime <= wp.time + wp.duration) {
            color = 'rgba(255, 201, 74, 0.9)';
            radius = 18;
          }

          ctx.beginPath();
          ctx.arc(wpScreenX, wp.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();

          if (!wp.hit && !wp.passed) {
            ctx.beginPath();
            ctx.arc(wpScreenX, wp.y, radius + 4, 0, Math.PI * 2);
            ctx.strokeStyle = color.replace(/[\d.]+\)$/, '0.3)');
            ctx.lineWidth = 2;
            ctx.stroke();

            const hitRadius = hitZones * (canvas.height * 0.8 / noteRange);
            ctx.beginPath();
            ctx.arc(wpScreenX, wp.y, hitRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(125, 92, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      if (mode === 'C' && state.contourPoints.length > 1) {
        const pixelsPerSecond = canvas.width / song.duration;
        const scrollOffset = state.elapsedTime * pixelsPerSecond;

        ctx.strokeStyle = '#7D5CFF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        let started = false;
        for (const pt of state.contourPoints) {
          const sx = pt.x - scrollOffset + 80;
          if (sx < -100 || sx > canvas.width + 100) continue;
          if (!started) {
            ctx.moveTo(sx, pt.y);
            started = true;
          } else {
            ctx.lineTo(sx, pt.y);
          }
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(125, 92, 255, 0.2)';
        ctx.lineWidth = hitZones * 2 * (canvas.height * 0.8 / noteRange);
        ctx.beginPath();
        started = false;
        for (const pt of state.contourPoints) {
          const sx = pt.x - scrollOffset + 80;
          if (sx < -100 || sx > canvas.width + 100) continue;
          if (!started) {
            ctx.moveTo(sx, pt.y);
            started = true;
          } else {
            ctx.lineTo(sx, pt.y);
          }
        }
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      if (isSinging && currentPitch > 0) {
        state.playerTrail.push({ x: 80, y: planeY, alpha: 1 });
      }
      state.playerTrail = state.playerTrail
        .map(p => ({ ...p, x: p.x - 1, alpha: p.alpha - 0.02 }))
        .filter(p => p.alpha > 0 && p.x > 0);

      if (state.playerTrail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(state.playerTrail[0].x, state.playerTrail[0].y);
        for (let i = 1; i < state.playerTrail.length; i++) {
          ctx.lineTo(state.playerTrail[i].x, state.playerTrail[i].y);
        }
        ctx.strokeStyle = isAccurate ? 'rgba(67, 231, 255, 0.4)' : 'rgba(200, 200, 200, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      PlaneGraphics.drawPlane(ctx, 80, planeY, pitchAngle, isAccurate);

      const totalNotes = mode === 'A'
        ? state.waypoints.length
        : Math.max(1, state.totalChecked);
      const currentAccuracy = (state.hitCount + state.missCount) > 0
        ? state.accuracySum / Math.max(1, state.hitCount)
        : 0;

      PlaneGraphics.drawHUD(
        ctx, canvas.width, canvas.height,
        isSinging ? currentPitch : 0,
        currentAccuracy,
        state.score,
        state.combo,
        state.elapsedTime,
        song.duration,
        isSinging
      );

      if (!isPaused && !isSinging) {
        ctx.fillStyle = 'rgba(255, 107, 107, 0.6)';
        ctx.font = 'bold 12px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sing to fly the plane!', canvas.width / 2, canvas.height - 50);
      }

      if (state.elapsedTime >= song.duration && !state.ended) {
        state.ended = true;
        const finalAccuracy = state.hitCount > 0 ? (state.accuracySum / state.hitCount) : 0;
        const totalAttempted = state.hitCount + state.missCount;
        onGameOverRef.current(state.score, finalAccuracy >= 60, {
          accuracy: finalAccuracy,
          maxCombo: state.maxCombo,
          notesHit: state.hitCount,
          notesMissed: state.missCount,
          smoothnessScore: 85,
          vibratoQuality: 0,
          playtime: state.elapsedTime,
        });
        return;
      }

      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameId);
  }, [audioController, song, level, mode, isPaused, initializeGame]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
