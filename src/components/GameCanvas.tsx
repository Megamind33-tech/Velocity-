import React, { useEffect, useRef, useState } from 'react';
import { AudioController } from '../lib/audio';
import { Song } from '../lib/songs';
import { GameHUD } from './GameHUD';

interface GameStats {
  perfectGates: number;
  maxCombo: number;
  totalGates: number;
}

interface GameCanvasProps {
  audioController: AudioController;
  onGameOver: (score: number, win?: boolean, stats?: GameStats) => void;
  onCheckpointReached?: (checkpoint: { score: number, currentLyricIndex: number, obstaclesPassed: number }) => void;
  difficulty: 'easy' | 'medium' | 'hard';
  song?: Song | null;
  level: number;
  isPaused: boolean;
  initialCheckpoint?: { score: number, currentLyricIndex: number, obstaclesPassed: number } | null;
}

const DIFFICULTY_PARAMS = {
  easy: { spawnRate: 180, gapSize: 160, baseWidth: 120, forgiveness: 1.5, scoreMultiplier: 0.8, breathPenaltyThreshold: null },
  medium: { spawnRate: 150, gapSize: 120, baseWidth: 80, forgiveness: 1.0, scoreMultiplier: 1.0, breathPenaltyThreshold: null },
  hard: { spawnRate: 110, gapSize: 80, baseWidth: 60, forgiveness: 0.7, scoreMultiplier: 1.5, breathPenaltyThreshold: 30 },
};

interface Obstacle {
  type: 'pitch' | 'volume';
  x: number;
  width: number;
  gapTop: number;
  gapBottom: number;
  passed: boolean;
  targetNoteName?: string;
  targetY?: number;
  requiredVolume?: number;
  volumeProgress?: number;
  lyricWord?: string;
  shape?: 'long' | 'staccato' | 'default';
  passedFrame?: number | null;
}

interface Particle {
  x: number;
  y: number;
  life: number;
  vx: number;
  vy: number;
  color?: string;
  size?: number;
}

interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface Collectible {
  x: number;
  y: number;
  size: number;
  collected: boolean;
  type: 'score' | 'multiplier';
  pulse: number;
}

const THEMES = [
  {
    name: 'Midnight Horizon',
    sky: ['#020617', '#0f172a', '#1e293b'],
    grid: 'rgba(56, 189, 248, 0.2)',
    bgType: 'city',
    bgFront: '#0f172a', bgSide: '#020617', bgTop: '#1e293b',
    gateFront: '#38bdf8', gateSide: '#0ea5e9', gateTop: '#7dd3fc',
    weather: 'none',
    textColor: '#f8fafc',
    fogColor: '15, 23, 42',
    fogDensity: 0.4
  },
  {
    name: 'Cloud Nine',
    sky: ['#0ea5e9', '#38bdf8', '#bae6fd'],
    grid: 'rgba(255, 255, 255, 0.3)',
    bgType: 'mountains',
    bgFront: '#f1f5f9', bgSide: '#cbd5e1', bgTop: '#ffffff',
    gateFront: '#0284c7', gateSide: '#075985', gateTop: '#38bdf8',
    weather: 'none',
    textColor: '#0f172a',
    fogColor: '224, 242, 254',
    fogDensity: 0.6
  },
  {
    name: 'Deep Space',
    sky: ['#000000', '#1e1b4b', '#312e81'],
    grid: 'rgba(139, 92, 246, 0.2)',
    bgType: 'mountains',
    bgFront: '#1e1b4b', bgSide: '#0f172a', bgTop: '#4338ca',
    gateFront: '#8b5cf6', gateSide: '#6d28d9', gateTop: '#a78bfa',
    weather: 'none',
    textColor: '#f5f3ff',
    fogColor: '15, 23, 42',
    fogDensity: 0.8
  }
];

const drawEnergyRing = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, targetY: number, frameCount: number, color: string, passed: boolean) => {
  const centerX = x + w / 2;
  const centerY = targetY;
  const radius = 60;
  const pulse = Math.sin(frameCount * 0.1) * 5;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  
  // Outer Glow
  const glowGrad = ctx.createRadialGradient(0, 0, radius - 10, 0, 0, radius + 20);
  glowGrad.addColorStop(0, 'transparent');
  glowGrad.addColorStop(0.5, passed ? 'rgba(74, 222, 128, 0.3)' : `${color}44`);
  glowGrad.addColorStop(1, 'transparent');
  
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius + 20 + pulse, 0, Math.PI * 2);
  ctx.fill();
  
  // Main Ring
  ctx.strokeStyle = passed ? '#4ade80' : color;
  ctx.lineWidth = 8;
  ctx.setLineDash([20, 10]);
  ctx.lineDashOffset = -frameCount * 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner Ring
  ctx.setLineDash([]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(0, 0, radius - 5 + pulse, 0, Math.PI * 2);
  ctx.stroke();
  
  // Core Energy
  if (!passed) {
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius - 10);
    coreGrad.addColorStop(0, `${color}22`);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
};

const drawBuildingDetails = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, layer: number, frameCount: number, themeName: string) => {
  if (layer < 1) return; // Too far back for details

  const windowRows = Math.floor(h / 25);
  const windowCols = Math.floor(w / 15);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < windowCols; i++) {
    for (let j = 0; j < windowRows; j++) {
      // Only draw some windows as "lit"
      const isLit = Math.sin(i * 1.5 + j * 2.1 + x * 0.01) > 0.8;
      if (isLit) {
        const flicker = 0.7 + Math.sin(frameCount * 0.05 + i + j) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 200, ${0.3 * flicker})`;
        ctx.fillRect(x + i * 15 + 4, y + j * 25 + 4, 7, 10);
      }
    }
  }
};

const draw3DBox = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, depth: number, front: string | CanvasGradient, side: string | CanvasGradient, top: string | CanvasGradient) => {
  const depthX = depth * 0.6;
  const depthY = depth * 0.3;
  
  // Front
  ctx.fillStyle = front;
  ctx.fillRect(x, y, w, h);
  
  // Subtle highlight on front
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  // Side (right)
  ctx.fillStyle = side;
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w + depthX, y - depthY);
  ctx.lineTo(x + w + depthX, y + h - depthY);
  ctx.lineTo(x + w, y + h);
  ctx.fill();
  
  // Top
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + depthX, y - depthY);
  ctx.lineTo(x + w + depthX, y - depthY);
  ctx.lineTo(x + w, y);
  ctx.fill();
};

const drawMountain = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, depth: number, front: string | CanvasGradient, side: string | CanvasGradient, top: string | CanvasGradient, frameCount: number) => {
  const depthX = depth * 0.6;
  const depthY = depth * 0.3;

  // Front face with gradient
  const grad = ctx.createLinearGradient(x, y - h, x, y);
  grad.addColorStop(0, '#ffffff'); // Snow cap
  grad.addColorStop(0.2, '#ffffff');
  grad.addColorStop(0.5, front as string);
  grad.addColorStop(1, '#1e293b');
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w / 2, y - h);
  ctx.lineTo(x + w, y);
  ctx.fill();
  
  // Side/Highlight face
  ctx.fillStyle = side;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - h);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w + depthX, y - depthY);
  ctx.lineTo(x + w / 2 + depthX, y - h - depthY);
  ctx.fill();
};

const drawPitchMeter = (ctx: CanvasRenderingContext2D, audioController: any, currentObstacle: any) => {
  if (!audioController.isSinging || !currentObstacle || currentObstacle.type !== 'pitch') return;

  const x = 30;
  const y = 150;
  const height = 200;
  const width = 20;

  ctx.save();
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(x, y, width, height);
  
  // Perfect Range (±15 cents)
  const perfectRange = 30; // 15 + 15
  const perfectHeight = (perfectRange / 200) * height; // Assuming ±100 cents range
  ctx.fillStyle = 'rgba(74, 222, 128, 0.5)';
  ctx.fillRect(x, y + (height / 2) - (perfectHeight / 2), width, perfectHeight);

  // Current Pitch Marker
  const cents = Math.max(-100, Math.min(100, audioController.currentCents));
  const markerY = y + (height / 2) - (cents / 100) * (height / 2);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 5, markerY - 2, width + 10, 4);
  
  // Labels
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('+100', x - 5, y + 10);
  ctx.fillText('0', x - 5, y + height / 2 + 5);
  ctx.fillText('-100', x - 5, y + height);

  ctx.restore();
};

export const GameCanvas: React.FC<GameCanvasProps> = ({ audioController, onGameOver, onCheckpointReached, difficulty: propDifficulty, song, level, isPaused, initialCheckpoint }) => {
  const difficulty = song ? song.difficulty : propDifficulty;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [themeName, setThemeName] = useState('');
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);
  const [hudData, setHudData] = useState({
    score: 0,
    highScore: 0,
    combo: 0,
    comboMultiplier: 1,
    perfectStreak: 0,
    currentNote: '--',
    cents: 0,
    isSinging: false,
    isPerfect: false,
    lyrics: [] as string[],
    breathProgress: 0,
    isDying: false,
    trackTitle: '',
    themeName: '',
    pitchY: 0.5,
    volume: 0,
    dynamicDifficulty: 1.0,
    feedbackMessage: undefined as string | undefined
  });
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      if (mobile) {
        setShowOrientationWarning(window.innerHeight > window.innerWidth);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 48; // Subtract banner ad height (48px)
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Select theme based on level
    const themeIndex = Math.max(0, (level - 1) % THEMES.length);
    const theme = THEMES[themeIndex];
    if (!theme) {
      console.error('Invalid theme index:', themeIndex, 'for level:', level);
      return;
    }
    setThemeName(theme.name);

    let animationFrameId: number;
    let score = initialCheckpoint?.score || 0;

    // Game State
    let playerY = canvas.height / 2;
    let targetY = canvas.height / 2;
    const playerX = canvas.width * 0.2;
    let obstacles: Obstacle[] = [];
    let collectibles: Collectible[] = [];
    let frameCount = 0;
    let distanceTraveled = 0;
    let particles: Particle[] = [];
    let weatherParticles: WeatherParticle[] = [];
    let obstaclesPassed = initialCheckpoint?.obstaclesPassed || 0;
    let totalGates = initialCheckpoint?.obstaclesPassed || 0; // Initialize with passed count if starting from checkpoint
    
    // Initialize Weather (Larger pool for scaling)
    const maxWeatherParticles = 600;
    for (let i = 0; i < maxWeatherParticles; i++) {
      weatherParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: theme.weather === 'rain' ? -2 - Math.random() * 2 : theme.weather === 'dust' ? -15 - Math.random() * 15 : -1 - Math.random(),
        vy: theme.weather === 'rain' ? 15 + Math.random() * 10 : theme.weather === 'snow' ? 2 + Math.random() * 2 : (Math.random() - 0.5) * 4,
        size: theme.weather === 'dust' ? Math.random() * 4 + 1 : Math.random() * 3 + 1
      });
    }

    // Combo State
    let combo = 0;
    let comboMultiplier = 1;
    let comboPulseTimer = 0;
    
    // Song State
    let currentLyricIndex = initialCheckpoint?.currentLyricIndex || 0;
    let nextSpawnFrame = frameCount;
    let songCompleted = false;

    // Breath Penalty State
    let silenceFrames = 0;
    let breathPenaltyApplied = false;
    let penaltyVisualTimer = 0;
    let checkpointVisualTimer = 0;
    let dynamicDifficulty = 1.0; // 0.8 to 1.5
    let perfectStreak = 0;
    let shakeTimer = 0;
    let perfectGlowTimer = 0;
    let isDying = false;

    // Vocal Coach Range: C3 (48) to C5 (72)
    const minNote = 48;
    const maxNote = 72;
    const noteRange = maxNote - minNote;

    const playCrashSound = () => {
      const ctx = audioController.audioCtx;
      if (!ctx || ctx.state !== 'running') return;

      // Noise for crash
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();

      // Low thud
      const osc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
      thudGain.gain.setValueAtTime(0.5, ctx.currentTime);
      thudGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(thudGain);
      thudGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    };

    const getNoteString = (noteNum: number) => {
      const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      const octave = Math.floor(noteNum / 12) - 1;
      return `${noteStrings[noteNum % 12]}${octave}`;
    };

    const playAudioCue = (pan: number, frequency: number = 440) => {
      const ctx = audioController.audioCtx;
      if (!ctx || ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (ctx.createStereoPanner) {
        const panner = ctx.createStereoPanner();
        panner.pan.value = pan;
        osc.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(gain);
      }
      
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.value = frequency;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    };

    let perfectGates = 0;
    let maxCombo = 0;
    let currentFeedback = "";
    let feedbackTimer = 0;

    const triggerHaptic = (pattern: number | number[]) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    };

    const loop = () => {
      if (isPausedRef.current) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      audioController.update();
      
      // 1. Update Player Y based on pitch
      if (audioController.isSinging && audioController.pitch > 0) {
        const noteNum = 12 * Math.log2(audioController.pitch / 440) + 69;
        let normalized = (noteNum - minNote) / noteRange;
        normalized = Math.max(0, Math.min(1, normalized));
        targetY = canvas.height - (normalized * canvas.height);
        playerY += (targetY - playerY) * 0.15; // Smoothing
      } else {
        targetY = playerY + 2;
        playerY += (targetY - playerY) * 0.1;
        if (playerY > canvas.height) playerY = canvas.height;
      }

      // 1.5 Breath Penalty Logic
      const isNoteExpected = obstacles.some(obs => !obs.passed);
      if (DIFFICULTY_PARAMS[difficulty].breathPenaltyThreshold !== null) {
        const penaltyThreshold = DIFFICULTY_PARAMS[difficulty].breathPenaltyThreshold!;
        if (!audioController.isSinging && isNoteExpected) {
          silenceFrames++;
          if (silenceFrames > penaltyThreshold && !breathPenaltyApplied) {
            score = Math.max(0, score - 75);
            dynamicDifficulty = Math.max(0.8, dynamicDifficulty - 0.08);
            perfectStreak = 0;
            combo = 0;
            breathPenaltyApplied = true;
            penaltyVisualTimer = 60;
          }
        } else if (audioController.isSinging) {
          silenceFrames = 0;
          breathPenaltyApplied = false;
        }
      }
      if (penaltyVisualTimer > 0) penaltyVisualTimer--;
      if (checkpointVisualTimer > 0) checkpointVisualTimer--;
      if (comboPulseTimer > 0) comboPulseTimer--;
      if (shakeTimer > 0) {
        shakeTimer--;
        if (shakeTimer <= 0 && isDying) {
          const finalScore = Math.floor(score);
          const savedHighScore = localStorage.getItem('highScore');
          if (!savedHighScore || finalScore > parseInt(savedHighScore, 10)) {
            localStorage.setItem('highScore', finalScore.toString());
            setHighScore(finalScore);
          }
          onGameOver(finalScore, false, { perfectGates, maxCombo, totalGates: totalGates + (isDying ? 1 : 0) });
          return;
        }
      }
      if (perfectGlowTimer > 0) perfectGlowTimer--;

      // 1. Calculate Game Speed based on tempo and beat-to-arrival time
      const framesPerBeat = (60 * 60) / (song ? song.tempo : 100);
      // Obstacles take a fixed number of beats to cross the screen from spawn to playerX
      const beatsToCross = difficulty === 'easy' ? 6 : difficulty === 'hard' ? 3 : 4;
      const arrivalFrames = beatsToCross * framesPerBeat;
      const distanceToTravel = canvas.width - playerX;

      // Dynamic Speed Multiplier: Increases with score/distance/streak, decreases if struggling
      const scoreBonus = Math.min(1.0, score / 10000);
      const distanceBonus = Math.min(0.8, distanceTraveled / 100000);
      const streakBonus = Math.min(0.2, perfectStreak / 50);
      
      // Struggle Penalty: More aggressive if silent for long periods
      const lowComboPenalty = combo < 3 ? 0.2 : 0;
      const silencePenalty = Math.min(0.4, silenceFrames / 300);
      const strugglePenalty = lowComboPenalty + silencePenalty;
      
      const dynamicSpeedMultiplier = Math.max(0.7, 1 + scoreBonus + distanceBonus + streakBonus - strugglePenalty);

      const gameSpeed = (distanceToTravel / arrivalFrames) * dynamicDifficulty * dynamicSpeedMultiplier;
      const dynamicWidth = (difficulty === 'easy' ? 120 : difficulty === 'hard' ? 60 : 80) + Math.min(220, (score / 25) + (gameSpeed * 4));

      // 2. Spawn Obstacles
      if (song && frameCount >= nextSpawnFrame && currentLyricIndex < song.sequence.length) {
        const lyric = song.sequence[currentLyricIndex];
        
        // Dynamically adjust difficulty at phrase starts
        if (lyric.phraseStart) {
          dynamicDifficulty = Math.min(1.5, dynamicDifficulty + 0.05);
        }

        // Calculate melodic contour offset (pitch change pressure)
        let contourOffset = 0;
        if (currentLyricIndex > 0) {
          const prevNote = song.sequence[currentLyricIndex - 1].note;
          const currentNote = lyric.note;
          const diff = currentNote - prevNote;
          // Apply a pressure factor based on the pitch difference
          contourOffset = diff * 8; // Increased factor for more visible path shaping
        }

        const targetNote = lyric.note;
        // Apply contourOffset to obsTargetY to shape the path, clamped to stay on screen
        const rawY = canvas.height - ((targetNote - minNote) / noteRange) * canvas.height - contourOffset;
        const obsTargetY = Math.max(50, Math.min(canvas.height - 50, rawY));
        
        const durationInBeats = lyric.duration || 1;
        const baseWidth = DIFFICULTY_PARAMS[difficulty].baseWidth;
        const dynamicWidth = baseWidth * durationInBeats + Math.min(220, (score / 25) + (gameSpeed * 4));

        const baseGapSize = DIFFICULTY_PARAMS[difficulty].gapSize;
        // Tighten gap at phrase starts for added challenge
        const gapMultiplier = lyric.phraseStart ? 0.8 : 1.0;
        const currentGapSize = Math.max(35, (baseGapSize - (score / 15)) / dynamicDifficulty) * gapMultiplier;

        // Determine shape based on duration
        const shape = durationInBeats >= 2 ? 'long' : durationInBeats < 1 ? 'staccato' : 'default';

        obstacles.push({
          type: 'pitch', x: canvas.width, width: dynamicWidth, shape,
          gapTop: obsTargetY - currentGapSize / 2, gapBottom: obsTargetY + currentGapSize / 2,
          passed: false, targetNoteName: getNoteString(targetNote), targetY: obsTargetY, lyricWord: lyric.word, passedFrame: null
        });
        
        const framesPerBeat = (60 * 60) / song.tempo;
        nextSpawnFrame = frameCount + (durationInBeats * framesPerBeat);
        currentLyricIndex++;
      } else if (!song) {
        const baseSpawnRate = DIFFICULTY_PARAMS[difficulty].spawnRate;
        const spawnRate = Math.max(40, baseSpawnRate / dynamicDifficulty);
        if (frameCount % Math.floor(spawnRate) === 0 && frameCount > 0) {
          const isVolumeGate = Math.random() < 0.25;
          if (isVolumeGate) {
            obstacles.push({
              type: 'volume', x: canvas.width, width: dynamicWidth,
              gapTop: canvas.height / 2, gapBottom: canvas.height / 2,
              passed: false, requiredVolume: 0.1 + Math.random() * 0.15, volumeProgress: 0, passedFrame: null
            });
          } else {
            const naturalNotes = [];
            for (let i = minNote + 2; i <= maxNote - 2; i++) {
              if ([0, 2, 4, 5, 7, 9, 11].includes(i % 12)) naturalNotes.push(i);
            }
            const targetNote = naturalNotes[Math.floor(Math.random() * naturalNotes.length)];
            const obsTargetY = canvas.height - ((targetNote - minNote) / noteRange) * canvas.height;
            const baseGapSize = DIFFICULTY_PARAMS[difficulty].gapSize;
            const currentGapSize = Math.max(35, (baseGapSize - (score / 15)) / dynamicDifficulty);

            obstacles.push({
              type: 'pitch', x: canvas.width, width: dynamicWidth,
              gapTop: obsTargetY - currentGapSize / 2, gapBottom: obsTargetY + currentGapSize / 2,
              passed: false, targetNoteName: getNoteString(targetNote), targetY: obsTargetY, passedFrame: null
            });
          }
        }
      }

      // 2.1 Spawn Collectibles
      if (frameCount % 180 === 0 && !isDying) {
        const targetNote = minNote + Math.floor(Math.random() * noteRange);
        const spawnY = canvas.height - ((targetNote - minNote) / noteRange) * canvas.height;
        collectibles.push({
          x: canvas.width + 100,
          y: spawnY,
          size: 15,
          collected: false,
          type: Math.random() > 0.8 ? 'multiplier' : 'score',
          pulse: 0
        });
      }

      if (song && currentLyricIndex >= song.sequence.length && obstacles.length === 0 && !songCompleted) {
        songCompleted = true;
        const finalScore = Math.floor(score);
        const savedHighScore = localStorage.getItem('highScore');
        if (!savedHighScore || finalScore > parseInt(savedHighScore, 10)) {
          localStorage.setItem('highScore', finalScore.toString());
          setHighScore(finalScore);
        }
        onGameOver(finalScore, true, { perfectGates, maxCombo, totalGates });
        return;
      }

      // 2.5 Directional Audio Cues
      const upcomingObstacle = obstacles.find(obs => !obs.passed && obs.x > playerX);
      if (upcomingObstacle && frameCount % 30 === 0) {
        let pan = (upcomingObstacle.x - playerX) / (canvas.width - playerX);
        pan = Math.max(-1, Math.min(1, pan));
        
        let frequency = 440;
        if (upcomingObstacle.type === 'pitch' && upcomingObstacle.targetY !== undefined) {
          const targetNote = minNote + ((canvas.height - upcomingObstacle.targetY) / canvas.height) * noteRange;
          frequency = 440 * Math.pow(2, (targetNote - 69) / 12);
        } else if (upcomingObstacle.type === 'volume') {
          frequency = 220;
        }
        
      }

      // 1. Survival Points (5 points per second)
      // score += 5 / 60;

      // 2. Movement Points (based on speed)
      // score += gameSpeed / 100;
      distanceTraveled += gameSpeed;

      // 3. Update Obstacles & Collision
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;

        if (obs.type === 'volume') {
          if (obs.x - playerX < 500 && audioController.volume >= obs.requiredVolume!) {
            obs.volumeProgress! += 1 / 60;
            if (obs.volumeProgress! > 1) obs.volumeProgress = 1;
          }
          obs.gapTop = (canvas.height / 2) * (1 - obs.volumeProgress!);
          obs.gapBottom = canvas.height - (canvas.height / 2) * (1 - obs.volumeProgress!);
        }

        if (playerX + 15 > obs.x && playerX - 15 < obs.x + obs.width) {
          if (playerY - 10 < obs.gapTop || playerY + 10 > obs.gapBottom) {
            if (!isDying) {
              isDying = true;
              shakeTimer = 60; // Increased duration for more impact
              playCrashSound();
              triggerHaptic([100, 50, 100]);
              // Add explosion particles and debris
              for (let p = 0; p < 100; p++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 25 + 5;
                particles.push({
                  x: playerX, y: playerY, life: 1.5,
                  vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                  color: p % 3 === 0 ? '#ef4444' : p % 3 === 1 ? '#f97316' : '#475569', // red, orange, dark debris
                  size: Math.random() * 12 + 4
                });
              }
              // Add some "smoke" particles
              for (let s = 0; s < 40; s++) {
                particles.push({
                  x: playerX, y: playerY, life: 2.0,
                  vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 10,
                  color: 'rgba(100, 116, 139, 0.5)', size: Math.random() * 20 + 10
                });
              }
            }
            return;
          }
        }

        if (!obs.passed && obs.x + obs.width < playerX) {
          obs.passed = true;
          obs.passedFrame = frameCount;
          combo++;
          obstaclesPassed++;
          totalGates++;
          if (combo > maxCombo) maxCombo = combo;
          
          if (obs.type === 'volume') {
            score += 100;
            // Particle effect for success
            for (let p = 0; p < 30; p++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 10 + 5;
              particles.push({
                x: obs.x + obs.width / 2,
                y: canvas.height / 2,
                life: 1.0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: '#22c55e',
                size: Math.random() * 8 + 2
              });
            }
          }
          
          const gateCenter = (obs.gapTop + obs.gapBottom) / 2;
          const isPerfect = Math.abs(playerY - gateCenter) < 30;
          if (isPerfect) {
            triggerHaptic(50);
            perfectGates++;
            perfectStreak++;
            perfectGlowTimer = 25;
            dynamicDifficulty = Math.min(1.5, dynamicDifficulty + 0.02);
            
            // Impactful particle burst for perfect hit
            for (let p = 0; p < 40; p++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * 12 + 4;
              particles.push({
                x: playerX,
                y: playerY,
                life: 1.0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: '#fde047', // yellow/gold
                size: Math.random() * 8 + 4
              });
            }
          } else {
            // Not perfect, but passed. 
            perfectStreak = 0;
            if (combo > 10) {
              dynamicDifficulty = Math.min(1.5, dynamicDifficulty + 0.005);
            } else if (combo < 5) {
              // Struggling to maintain combo
              dynamicDifficulty = Math.max(0.8, dynamicDifficulty - 0.01);
            }
          }
          
          comboMultiplier = Math.min(4, 1 + Math.floor(combo / 5));
          comboPulseTimer = 20;
          if (obs.type === 'pitch') {
            score += 50;
          } else if (obs.type === 'volume') {
            score += 10;
          }

          // Checkpoint logic
          if (obstaclesPassed % 5 === 0 && onCheckpointReached) {
            triggerHaptic([100, 50, 100, 50, 100]);
            checkpointVisualTimer = 90;
            onCheckpointReached({
              score: Math.floor(score),
              currentLyricIndex,
              obstaclesPassed
            });
          }
          
          for (let p = 0; p < 30; p++) {
            particles.push({
              x: obs.x + obs.width / 2, y: playerY, life: 1.0,
              vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 0.5) * 15,
              color: obs.type === 'pitch' ? theme.gateTop : '#f87171',
              size: Math.random() * 6 + 2
            });
          }
        }

        if (obs.x + obs.width < -100) obstacles.splice(i, 1);
      }

      // 3.1 Update Collectibles
      for (let i = collectibles.length - 1; i >= 0; i--) {
        const c = collectibles[i];
        c.x -= gameSpeed;
        c.pulse = (c.pulse + 0.1) % (Math.PI * 2);

        if (!c.collected && Math.hypot(playerX - c.x, playerY - c.y) < 40) {
          c.collected = true;
          if (c.type === 'score') {
            score += 100 * comboMultiplier;
          } else {
            combo += 5;
            comboMultiplier = Math.min(4, 1 + Math.floor(combo / 5));
          }
          
          // Collection particles
          for (let p = 0; p < 20; p++) {
            particles.push({
              x: c.x, y: c.y, life: 1.0,
              vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
              color: c.type === 'multiplier' ? '#a855f7' : '#fbbf24',
              size: Math.random() * 5 + 2
            });
          }
        }

        if (c.x < -100 || c.collected) collectibles.splice(i, 1);
      }

      score += 1 / 60;

      // 4. Particles
      if (frameCount % 3 === 0) {
        particles.push({
          x: playerX - 15, y: playerY, life: 1.0,
          vx: -gameSpeed * 0.5 - Math.random() * 2, vy: (Math.random() - 0.5),
          color: '#ffffff', size: 4
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Weather update
      const weatherIntensity = Math.min(1.0, gameSpeed / 15);
      const activeWeatherCount = Math.floor(weatherIntensity * weatherParticles.length);
      
      for (let i = 0; i < activeWeatherCount; i++) {
        const wp = weatherParticles[i];
        const speedScale = 1 + (gameSpeed / 10);
        wp.x += wp.vx * speedScale;
        wp.y += wp.vy * speedScale;
        if (theme.weather === 'snow') wp.x += Math.sin(frameCount * 0.05 + wp.y) * 1;
        if (theme.weather === 'dust') wp.y += Math.sin(frameCount * 0.1 + wp.x) * 2; // Swirling dust
        
        if (wp.y > canvas.height) wp.y = 0;
        if (wp.y < 0) wp.y = canvas.height;
        if (wp.x < 0) wp.x = canvas.width;
        if (wp.x > canvas.width) wp.x = 0;
      }

      // --- DRAWING ---
      if (shakeTimer > 0) {
        const shakeAmount = (shakeTimer / 60) * 35; // Increased intensity
        ctx.save();
        ctx.translate((Math.random() - 0.5) * shakeAmount, (Math.random() - 0.5) * shakeAmount);
        ctx.rotate((Math.random() - 0.5) * 0.05 * (shakeTimer / 60));
        
        // Flash effect
        if (shakeTimer > 40) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(shakeTimer - 40) / 20})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      // Sky
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, theme.sky[0]);
      gradient.addColorStop(0.4, theme.sky[1]);
      gradient.addColorStop(1, theme.sky[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars (only if not heavy weather)
      if (theme.weather === 'none' || theme.weather === 'snow') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 80; i++) {
          // Parallax stars: further stars move slower
          const starDepth = (Math.sin(i * 0.1) * 0.5 + 0.5) * 0.8 + 0.2; // 0.2 to 1.0
          const starSpeed = 0.02 * starDepth;
          const starX = ((Math.sin(i * 123.45) * 0.5 + 0.5) * canvas.width * 2 - distanceTraveled * starSpeed) % (canvas.width * 2);
          
          // Vertical parallax based on playerY
          const verticalParallax = (playerY - canvas.height / 2) * (0.05 * starDepth);
          const starY = (Math.cos(i * 321.12) * 0.5 + 0.5) * (canvas.height * 0.7) - verticalParallax;
          
          const starSize = (Math.sin(i * 42.1 + frameCount * 0.05) * 0.5 + 0.5) * 2 * starDepth;
          if (starX > -10 && starX < canvas.width + 10) {
            ctx.beginPath(); ctx.arc(starX, starY, starSize, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      const horizonY = canvas.height * 0.65;

      // Background Objects (City or Mountains)
      const numLayers = 3;
      for (let layer = 0; layer < numLayers; layer++) {
        // layer 0 is furthest back, layer 2 is closest
        const layerScale = 0.3 + (layer / (numLayers - 1)) * 0.5; // 0.3, 0.55, 0.8
        const layerSpeed = 0.02 + (layer / (numLayers - 1)) * 0.08; // 0.02, 0.06, 0.1
        const layerDepth = 8 + layer * 6; // 8, 14, 20
        const layerYOffset = (numLayers - 1 - layer) * 15; // Push further back layers up slightly
        
        // Vertical parallax for objects
        const verticalParallax = (playerY - canvas.height / 2) * (0.1 + layer * 0.1);
        
        const numObjects = 30;
        const spacing = 120 * layerScale;
        const totalWidth = numObjects * spacing;

        // Per-layer fog overlay (denser at further distances)
        if (theme.fogDensity > 0 && layer > 0) {
          ctx.save();
          // Each layer adds a bit more fog to the layers behind it
          const layerFogAlpha = (theme.fogDensity / numLayers) * (numLayers - layer);
          ctx.fillStyle = `rgba(${theme.fogColor}, ${layerFogAlpha})`;
          ctx.fillRect(0, 0, canvas.width, horizonY);
          ctx.restore();
        }

        for (let i = 0; i < numObjects; i++) {
          // Pseudo-random values for this specific building
          const rand1 = Math.sin(i * 12.3 + layer * 7) * 0.5 + 0.5;
          const rand2 = Math.cos(i * 45.6 + layer * 11) * 0.5 + 0.5;
          const rand3 = Math.sin(i * 78.9 + layer * 13) * 0.5 + 0.5;
          const rand4 = Math.cos(i * 23.4 + layer * 17) * 0.5 + 0.5;
          const rand5 = Math.sin(i * 99.1 + layer * 19) * 0.5 + 0.5;
          const rand6 = Math.cos(i * 55.5 + layer * 23) * 0.5 + 0.5;

          const bWidth = (30 + rand1 * 100) * layerScale;
          const bHeight = (60 + rand2 * 400) * layerScale;
          
          // Add irregular spacing
          const xOffset = (rand3 - 0.5) * 100 * layerScale;
          const bX = ((i * spacing + xOffset) - (distanceTraveled * layerSpeed) % totalWidth + totalWidth) % totalWidth - 200;
          
          if (bX > -200 && bX < canvas.width) {
            const drawY = horizonY - bHeight - layerYOffset - verticalParallax;
            
            // Atmospheric perspective: further layers are slightly more transparent
            // to blend with the sky/fog
            const alpha = 0.5 + (layer / (numLayers - 1)) * 0.5; // 0.5 to 1.0
            ctx.globalAlpha = alpha;

            if (theme.bgType === 'city') {
              draw3DBox(ctx, bX, drawY, bWidth, bHeight, layerDepth, theme.bgFront, theme.bgSide, theme.bgTop);
              drawBuildingDetails(ctx, bX, drawY, bWidth, bHeight, layer, frameCount, theme.name);
              
              // Stepped building (Setbacks)
              let hasSetback = false;
              let setW = 0, setH = 0, setX = 0, setbackY = drawY;
              let hasSetback2 = false;
              let setW2 = 0, setH2 = 0, setX2 = 0, setbackY2 = drawY;

              if (rand4 > 0.5 && bHeight > 100 * layerScale) {
                hasSetback = true;
                setW = bWidth * (0.4 + rand5 * 0.4);
                setH = bHeight * (0.2 + rand2 * 0.3);
                setX = bX + (bWidth - setW) / 2;
                setbackY = drawY - setH;
                draw3DBox(ctx, setX, setbackY, setW, setH, layerDepth * 0.6, theme.bgFront, theme.bgSide, theme.bgTop);
                drawBuildingDetails(ctx, setX, setbackY, setW, setH, layer, frameCount, theme.name);

                if (rand3 > 0.6 && bHeight > 150 * layerScale) {
                  hasSetback2 = true;
                  setW2 = setW * (0.3 + rand6 * 0.4);
                  setH2 = setH * (0.4 + rand1 * 0.4);
                  setX2 = setX + (setW - setW2) / 2;
                  setbackY2 = setbackY - setH2;
                  draw3DBox(ctx, setX2, setbackY2, setW2, setH2, layerDepth * 0.4, theme.bgFront, theme.bgSide, theme.bgTop);
                  drawBuildingDetails(ctx, setX2, setbackY2, setW2, setH2, layer, frameCount, theme.name);
                }
              }

              // Subtle color tint overlay for variety
              const tintColor = `hsla(${rand5 * 360}, ${20 + rand6 * 40}%, ${30 + rand1 * 30}%, 0.2)`;
              draw3DBox(ctx, bX, drawY, bWidth, bHeight, layerDepth, tintColor, tintColor, tintColor);
              if (hasSetback) draw3DBox(ctx, setX, setbackY, setW, setH, layerDepth * 0.6, tintColor, tintColor, tintColor);
              if (hasSetback2) draw3DBox(ctx, setX2, setbackY2, setW2, setH2, layerDepth * 0.4, tintColor, tintColor, tintColor);

              // Apply subtle color variation and ambient occlusion gradient
              const aoGrad = ctx.createLinearGradient(0, hasSetback2 ? setbackY2 : (hasSetback ? setbackY : drawY), 0, drawY + bHeight);
              aoGrad.addColorStop(0, `rgba(255, 255, 255, ${rand1 * 0.15})`); // slight highlight at top
              aoGrad.addColorStop(1, `rgba(0, 0, 0, ${0.2 + rand4 * 0.4})`); // darker at bottom
              
              draw3DBox(ctx, bX, drawY, bWidth, bHeight, layerDepth, aoGrad, aoGrad, 'transparent');
              if (hasSetback) {
                 draw3DBox(ctx, setX, setbackY, setW, setH, layerDepth * 0.6, aoGrad, aoGrad, 'transparent');
              }
              if (hasSetback2) {
                 draw3DBox(ctx, setX2, setbackY2, setW2, setH2, layerDepth * 0.4, aoGrad, aoGrad, 'transparent');
              }
              
              // Spire
              if (rand1 > 0.8 && !hasSetback2) {
                 const spireH = (20 + rand2 * 40) * layerScale;
                 const spireX = (hasSetback ? setX + setW / 2 : bX + bWidth / 2) - 1;
                 const spireY = hasSetback ? setbackY : drawY;
                 ctx.fillStyle = theme.bgSide;
                 ctx.fillRect(spireX, spireY - spireH, 2, spireH);
                 
                 // Spire blinking light
                 if (layer === 2 && Math.sin(frameCount * 0.1 + i * 2) > 0.8) {
                   ctx.fillStyle = '#ef4444';
                   ctx.fillRect(spireX - 1, spireY - spireH - 2, 4, 4);
                 }
              }
              
              // Cyberpunk Neon Accents
              if (theme.name === 'Cyberpunk Rain' && layer === 2 && rand2 > 0.5) {
                const neonPulse = Math.sin(frameCount * 0.1 + i) * 0.3 + 0.7;
                ctx.fillStyle = rand1 > 0.5 ? '#06b6d4' : '#ec4899'; // cyan or pink
                ctx.globalAlpha = alpha * neonPulse;
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 10 * neonPulse;
                if (rand3 > 0.5) {
                  // Vertical neon strip
                  ctx.fillRect(bX + bWidth * 0.1, drawY + 10, 2, bHeight - 20);
                  if (hasSetback) ctx.fillRect(setX + setW * 0.1, setbackY + 10, 2, setH - 10);
                } else {
                  // Horizontal neon strip near top
                  ctx.fillRect(bX + 5, drawY + 10, bWidth - 10, 2);
                  if (hasSetback) ctx.fillRect(setX + 5, setbackY + 10, setW - 10, 2);
                }
                ctx.shadowBlur = 0;
                ctx.globalAlpha = alpha;
              }

              // Building Paneling / Structural lines (LOD based on layer)
              if (layer > 0) {
                ctx.strokeStyle = `rgba(0, 0, 0, ${0.15 * layer})`;
                ctx.lineWidth = Math.max(0.5, layerScale);
                ctx.beginPath();
                
                const drawPanels = (x: number, y: number, w: number, h: number) => {
                  // Front vertical panels
                  const vPanels = Math.floor(3 + rand1 * 4);
                  for (let p = 1; p < vPanels; p++) {
                    const px = x + (w / vPanels) * p;
                    ctx.moveTo(px, y);
                    ctx.lineTo(px, y + h);
                  }
                  // Front horizontal panels
                  const hPanels = Math.floor(4 + rand2 * 8);
                  for (let p = 1; p < hPanels; p++) {
                    const py = y + (h / hPanels) * p;
                    ctx.moveTo(x, py);
                    ctx.lineTo(x + w, py);
                  }
                };
                
                drawPanels(bX, drawY, bWidth, bHeight);
                if (hasSetback) drawPanels(setX, setbackY, setW, setH);
                if (hasSetback2) drawPanels(setX2, setbackY2, setW2, setH2);
                ctx.stroke();
              }

              // Side Details (Vents / Pipes) for closest layer
              if (layer === 2 && rand3 > 0.4) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                const sideX = bX + bWidth;
                const dX = layerDepth * 0.6;
                const dY = layerDepth * 0.3;
                const numVents = Math.floor(2 + rand4 * 4);
                for (let v = 0; v < numVents; v++) {
                  const vY = drawY + 30 + v * 50;
                  if (vY < drawY + bHeight - 20) {
                    ctx.beginPath();
                    ctx.moveTo(sideX + dX * 0.2, vY - dY * 0.2);
                    ctx.lineTo(sideX + dX * 0.8, vY - dY * 0.8);
                    ctx.lineTo(sideX + dX * 0.8, vY + 15 - dY * 0.8);
                    ctx.lineTo(sideX + dX * 0.2, vY + 15 - dY * 0.2);
                    ctx.fill();
                    
                    // Vent grilles
                    ctx.strokeStyle = theme.bgSide;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(sideX + dX * 0.2, vY + 5 - dY * 0.2);
                    ctx.lineTo(sideX + dX * 0.8, vY + 5 - dY * 0.8);
                    ctx.moveTo(sideX + dX * 0.2, vY + 10 - dY * 0.2);
                    ctx.lineTo(sideX + dX * 0.8, vY + 10 - dY * 0.8);
                    ctx.stroke();
                  }
                }
              }

              // Roof details (Antenna / AC unit)
              if (rand1 > 0.5) {
                 const roofW = bWidth * 0.3;
                 const roofH = 10 * layerScale;
                 const roofX = bX + bWidth * 0.2;
                 draw3DBox(ctx, roofX, drawY - roofH, roofW, roofH, layerDepth * 0.5, theme.bgFront, theme.bgSide, theme.bgTop);
                 // AC fan detail on roof if close
                 if (layer === 2) {
                   ctx.fillStyle = 'rgba(0,0,0,0.6)';
                   ctx.beginPath();
                   ctx.arc(roofX + roofW/2, drawY - roofH + 2, Math.min(roofW*0.3, 4), 0, Math.PI*2);
                   ctx.fill();
                 }
              }
              if (rand2 > 0.7) {
                 ctx.fillStyle = theme.bgSide;
                 ctx.fillRect(bX + bWidth * 0.7, drawY - 20 * layerScale, 2 * layerScale, 20 * layerScale);
                 // Antenna blinking light
                 if (layer === 2 && Math.sin(frameCount * 0.1 + i) > 0.8) {
                   ctx.fillStyle = '#ef4444';
                   ctx.fillRect(bX + bWidth * 0.7 - 1, drawY - 22 * layerScale, 4 * layerScale, 4 * layerScale);
                 }
              }

              // Windows
              const baseWinAlpha = 0.1 + layer * 0.15;
              
              const drawWindows = (x: number, y: number, w: number, h: number) => {
                // Different window styles based on rand3
                if (rand3 > 0.6) {
                  // Horizontal strips
                  const stripH = Math.max(2, 4 * layerScale);
                  const stripSpacing = Math.max(8, 15 * layerScale);
                  for (let wy = 15 * layerScale; wy < h - 15 * layerScale; wy += stripSpacing) {
                    if (Math.sin(i * wy + frameCount * 0.002) > 0.2) {
                      const flicker = Math.sin(frameCount * 0.05 + wy) * 0.05;
                      ctx.fillStyle = `rgba(253, 224, 71, ${baseWinAlpha + flicker})`;
                      ctx.fillRect(x + 5 * layerScale, y + wy, w - 10 * layerScale, stripH);
                    }
                  }
                } else if (rand3 > 0.3) {
                  // Grid windows
                  const winW = Math.max(2, 6 * layerScale);
                  const winH = Math.max(4, 12 * layerScale);
                  const winSpacingX = Math.max(8, 18 * layerScale);
                  const winSpacingY = Math.max(12, 25 * layerScale);
                  for (let wy = 15 * layerScale; wy < h - 15 * layerScale; wy += winSpacingY) {
                    for (let wx = 8 * layerScale; wx < w - 10 * layerScale; wx += winSpacingX) {
                      const isLit = Math.sin(i * wx * wy + frameCount * 0.005) > 0.4;
                      if (isLit) {
                        const flicker = Math.sin(frameCount * 0.1 + wx + wy) * 0.1;
                        ctx.fillStyle = `rgba(253, 224, 71, ${baseWinAlpha + flicker})`;
                        ctx.fillRect(x + wx, y + wy, winW, winH);
                        
                        // Window frames for close layer
                        if (layer === 2) {
                          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                          ctx.lineWidth = 1;
                          ctx.strokeRect(x + wx, y + wy, winW, winH);
                        }
                      }
                    }
                  }
                } else {
                  // Sparse / Tall windows
                  const winW = Math.max(3, 8 * layerScale);
                  const winH = Math.max(10, 30 * layerScale);
                  const winSpacingX = Math.max(12, 25 * layerScale);
                  const winSpacingY = Math.max(20, 40 * layerScale);
                  for (let wy = 15 * layerScale; wy < h - 15 * layerScale; wy += winSpacingY) {
                    for (let wx = 8 * layerScale; wx < w - 10 * layerScale; wx += winSpacingX) {
                      if (Math.sin(i * wx * wy + frameCount * 0.003) > 0.7) {
                        const flicker = Math.sin(frameCount * 0.02 + wx * wy) * 0.1;
                        ctx.fillStyle = `rgba(253, 224, 71, ${baseWinAlpha + flicker})`;
                        ctx.fillRect(x + wx, y + wy, winW, winH);
                        
                        // Window frames and mullions for close layer
                        if (layer === 2) {
                          ctx.strokeStyle = 'rgba(0,0,0,0.4)';
                          ctx.lineWidth = 1;
                          ctx.strokeRect(x + wx, y + wy, winW, winH);
                          ctx.beginPath();
                          ctx.moveTo(x + wx, y + wy + winH/2);
                          ctx.lineTo(x + wx + winW, y + wy + winH/2);
                          ctx.stroke();
                        }
                      }
                    }
                  }
                }
              };
              
              drawWindows(bX, drawY, bWidth, bHeight);
              if (hasSetback) drawWindows(setX, setbackY, setW, setH);
              if (hasSetback2) drawWindows(setX2, setbackY2, setW2, setH2);
              
              drawBuildingDetails(ctx, bX, drawY, bWidth, bHeight, layer, frameCount, theme.name);
            } else if (theme.bgType === 'mountains') {
              // Mountains
              drawMountain(ctx, bX, horizonY - layerYOffset, bWidth * 2.5, bHeight * 1.2, layerDepth * 2, theme.bgFront, theme.bgSide, theme.bgTop, frameCount);
              
              // Subtle shading for mountains too
              const mntGrad = ctx.createLinearGradient(0, horizonY - layerYOffset - bHeight * 1.2, 0, horizonY - layerYOffset);
              mntGrad.addColorStop(0, `rgba(255, 255, 255, ${rand1 * 0.1})`);
              mntGrad.addColorStop(1, `rgba(0, 0, 0, ${0.2 + rand4 * 0.3})`);
              drawMountain(ctx, bX, horizonY - layerYOffset, bWidth * 2.5, bHeight * 1.2, layerDepth * 2, mntGrad, mntGrad, mntGrad, frameCount);
            }
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // Final Horizon Fog (Distance Fog)
      const fogGrad = ctx.createLinearGradient(0, horizonY - 250, 0, horizonY + 150);
      fogGrad.addColorStop(0, `rgba(${theme.fogColor}, 0)`);
      fogGrad.addColorStop(0.4, `rgba(${theme.fogColor}, ${theme.fogDensity * 0.8})`);
      fogGrad.addColorStop(0.6, `rgba(${theme.fogColor}, ${theme.fogDensity * 0.8})`);
      fogGrad.addColorStop(1, `rgba(${theme.fogColor}, 0)`);
      
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, horizonY - 250, canvas.width, 400);

      // Chase Overlay
      const chaseIntensity = Math.min(0.4, score / 50000);
      if (chaseIntensity > 0.05) {
        ctx.save();
        ctx.fillStyle = `rgba(220, 38, 38, ${chaseIntensity * (0.5 + Math.sin(frameCount * 0.1) * 0.5)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Audio Visualizer
      let dataArray = new Uint8Array(0);
      if (audioController.analyser) {
        dataArray = new Uint8Array(audioController.analyser.frequencyBinCount);
        audioController.analyser.getByteFrequencyData(dataArray);
      }

      if (dataArray.length > 0) {
        ctx.save();
        const numBars = 64;
        const barWidth = Math.ceil(canvas.width / numBars);
        const maxBarHeight = 200;
        const hue = audioController.isSinging && audioController.pitch > 0 ? 280 + (audioController.pitch % 80) : 320;
          
        const barGrad = ctx.createLinearGradient(0, horizonY - maxBarHeight, 0, horizonY);
        barGrad.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.8)`);
        barGrad.addColorStop(1, `hsla(${hue}, 100%, 60%, 0.1)`);
        ctx.fillStyle = barGrad;

        for (let i = 0; i < numBars; i++) {
          const symIndex = i < numBars / 2 ? i : numBars - 1 - i;
          const dataIndex = Math.floor(symIndex * 100 / (numBars / 2));
          const value = dataArray[dataIndex] || 0;
          const percent = value / 255;
          const barHeight = Math.pow(percent, 1.5) * maxBarHeight;
          if (barHeight > 0) ctx.fillRect(i * barWidth, horizonY - barHeight, barWidth - 1, barHeight);
        }
        ctx.restore();
      }

      // Ground
      ctx.fillStyle = theme.sky[2]; // Use darkest sky color for ground base
      ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

      // Visualizer Reflection
      if (dataArray.length > 0) {
        ctx.save();
        const numBars = 64;
        const barWidth = Math.ceil(canvas.width / numBars);
        const maxReflectHeight = 100;
        const hue = audioController.isSinging && audioController.pitch > 0 ? 280 + (audioController.pitch % 80) : 320;
        const reflectGrad = ctx.createLinearGradient(0, horizonY, 0, horizonY + maxReflectHeight);
        reflectGrad.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.3)`);
        reflectGrad.addColorStop(1, `hsla(${hue}, 100%, 60%, 0)`);
        ctx.fillStyle = reflectGrad;

        for (let i = 0; i < numBars; i++) {
          const symIndex = i < numBars / 2 ? i : numBars - 1 - i;
          const dataIndex = Math.floor(symIndex * 100 / (numBars / 2));
          const value = dataArray[dataIndex] || 0;
          const percent = value / 255;
          const barHeight = Math.pow(percent, 1.5) * maxReflectHeight;
          if (barHeight > 0) ctx.fillRect(i * barWidth, horizonY, barWidth - 1, barHeight);
        }
        ctx.restore();
      }

      // 3D Grid
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const gridOffset = (distanceTraveled * 1.5) % 40;
      
      for (let i = 0; i < 25; i++) {
        const z = Math.pow(i, 1.4) * 4;
        const y = horizonY + z + (gridOffset * (z / 100));
        if (y < canvas.height && y > horizonY) {
          const opacity = Math.min(1, (y - horizonY) / 50);
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1.0;
      
      ctx.beginPath();
      const vpX = canvas.width / 2;
      for (let i = -30; i < 30; i++) {
        const playerOffset = (playerX - canvas.width * 0.2) * 0.5;
        const x = vpX + i * 40 - playerOffset;
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(vpX + (x - vpX) * 15, canvas.height);
      }
      ctx.stroke();

      // Note Lanes
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      for (let i = minNote; i <= maxNote; i++) {
        const y = canvas.height - ((i - minNote) / noteRange) * canvas.height;
        const isNatural = [0, 2, 4, 5, 7, 9, 11].includes(i % 12);
        const isC = i % 12 === 0;

        if (isC) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(0, y, canvas.width, 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.font = '14px sans-serif';
          ctx.fillText(`C${Math.floor(i/12) - 1}`, 10, y - 10);
        } else if (isNatural) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.fillRect(0, y, canvas.width, 1);
        }
      }

      // Weather (Behind Plane)
      if (theme.weather !== 'none') {
        if (theme.weather === 'dust') {
          ctx.fillStyle = 'rgba(217, 119, 6, 0.15)'; // Dust haze overlay
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.fillStyle = theme.weather === 'rain' ? 'rgba(255,255,255,0.4)' : theme.weather === 'dust' ? 'rgba(253, 230, 138, 0.3)' : 'rgba(255,255,255,0.8)';
        
        const weatherIntensity = Math.min(1.0, gameSpeed / 15);
        const activeWeatherCount = Math.floor(weatherIntensity * weatherParticles.length);

        for (let i = 0; i < activeWeatherCount; i++) {
          const wp = weatherParticles[i];
          if (theme.weather === 'rain') {
            ctx.beginPath();
            ctx.moveTo(wp.x, wp.y);
            const speedScale = 1 + (gameSpeed / 10);
            ctx.lineTo(wp.x - wp.vx * 2 * speedScale, wp.y - wp.vy * 2 * speedScale);
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 1;
            ctx.stroke();
          } else if (theme.weather === 'dust') {
            ctx.beginPath();
            ctx.ellipse(wp.x, wp.y, wp.size * 4, wp.size, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, wp.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Milestone Markers
      for (let s = 1000; s <= score + 5000; s += 1000) {
        if (s > score && s < score + 2000) {
          const markerX = playerX + (s - score) * 2; // Simple mapping
          if (markerX > playerX && markerX < canvas.width) {
            ctx.save();
            ctx.fillStyle = '#fde047';
            ctx.font = 'bold 20px monospace';
            ctx.fillText(`${s} PTS`, markerX, canvas.height / 2);
            ctx.restore();
          }
        }
      }

      // Obstacles (3D Gates)
      const currentObstacle = obstacles.find(o => !o.passed);
      const isPerfectPitch = audioController.isSinging && currentObstacle && currentObstacle.type === 'pitch' && 
                            audioController.currentNote === currentObstacle.targetNoteName && 
                            Math.abs(audioController.currentCents) < 15;

      obstacles.forEach(obs => {
        ctx.save();
        
        if (obs.type === 'pitch') {
          // Draw Energy Ring for pitch gates
          drawEnergyRing(ctx, obs.x, 0, obs.width, canvas.height, obs.targetY!, frameCount, theme.gateFront, obs.passed);
          
          if (obs.lyricWord) {
            // Lyric words above gates removed from canvas as per UI overhaul
          }
        } else if (obs.type === 'volume') {
          // Volume gates - also use a modified energy ring or clean pillars
          const progress = obs.volumeProgress || 0;
          const volumePulse = 1 + Math.sin(frameCount * 0.2) * (audioController.volume * 0.2);
          const gateColor = progress > 0.8 ? '#22c55e' : progress > 0.4 ? '#eab308' : '#ef4444';
          const sideColor = progress > 0.8 ? '#166534' : progress > 0.4 ? '#a16207' : '#991b1b';
          const topColor = progress > 0.8 ? '#4ade80' : progress > 0.4 ? '#facc15' : '#f87171';
          
          const depth = 20;
          draw3DBox(ctx, obs.x, 0, obs.width, obs.gapTop * volumePulse, depth, gateColor, sideColor, topColor);
          draw3DBox(ctx, obs.x, obs.gapBottom, obs.width, (canvas.height - obs.gapBottom) * volumePulse, depth, gateColor, sideColor, topColor);
          
          if (!obs.passed && obs.volumeProgress! < 1) {
            // "SING LOUDER" and progress bar removed from canvas as per UI overhaul
          }
        }
        
        if (obs.passed && obs.passedFrame && frameCount - obs.passedFrame < 30) {
          // "PERFECT!" text removed from canvas as per UI overhaul
        }
        
        ctx.restore();
      });

      // Collectibles (Glowing Orbs)
      collectibles.forEach(c => {
        const pulseScale = 1 + Math.sin(c.pulse) * 0.2;
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = c.type === 'multiplier' ? '#a855f7' : '#fbbf24';
        ctx.fillStyle = c.type === 'multiplier' ? '#c084fc' : '#fcd34d';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size * pulseScale, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner glow
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(c.x, c.y, (c.size * 0.5) * pulseScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Particles
      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color || '#ffffff';
        ctx.shadowColor = p.color || '#ffffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (p.size || 4) * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 3D Plane
      ctx.save();
      ctx.translate(playerX, playerY);
      const tilt = (targetY - playerY) * 0.05;
      ctx.rotate(tilt);
      
      // Tuning Aura / Guidance
      if (audioController.isSinging && currentObstacle && currentObstacle.type === 'pitch') {
        const centsDiff = Math.abs(audioController.currentCents);
        const isCorrectNote = audioController.currentNote === currentObstacle.targetNoteName;
        
        if (isCorrectNote || centsDiff < 50) {
          const proximity = isCorrectNote ? Math.max(0, 1 - centsDiff / 50) : 0;
          const auraSize = 40 + proximity * 20;
          const auraAlpha = 0.1 + proximity * 0.3;
          const auraColor = proximity > 0.8 ? '74, 222, 128' : '56, 189, 248'; // Green if very close, Blue if just close
          
          ctx.save();
          ctx.beginPath();
          ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
          const auraGrad = ctx.createRadialGradient(0, 0, auraSize * 0.5, 0, 0, auraSize);
          auraGrad.addColorStop(0, `rgba(${auraColor}, 0)`);
          auraGrad.addColorStop(1, `rgba(${auraColor}, ${auraAlpha})`);
          ctx.fillStyle = auraGrad;
          ctx.fill();
          
          // Subtle directional indicator (arrow pointing to targetY)
          const yDiff = currentObstacle.targetY! - playerY;
          if (Math.abs(yDiff) > 20) {
            const arrowY = yDiff > 0 ? 35 : -35;
            ctx.fillStyle = `rgba(${auraColor}, ${auraAlpha * 2})`;
            ctx.beginPath();
            ctx.moveTo(-5, arrowY);
            ctx.lineTo(5, arrowY);
            ctx.lineTo(0, arrowY + (yDiff > 0 ? 10 : -10));
            ctx.fill();
          }
          ctx.restore();
        }
      }

      if (perfectGlowTimer > 0) {
        // Impactful flash effect
        const flashIntensity = perfectGlowTimer / 25;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 100 * flashIntensity);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.8 * flashIntensity})`);
        grad.addColorStop(0.5, `rgba(253, 224, 71, ${0.4 * flashIntensity})`);
        grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 100 * flashIntensity, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 30 + Math.sin(frameCount * 0.5) * 20;
      } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
      }
      ctx.shadowOffsetX = -10;
      ctx.shadowOffsetY = 20;

      // Plane Body (Sleek Jet)
      const bodyGrad = ctx.createLinearGradient(0, -15, 0, 15);
      bodyGrad.addColorStop(0, '#f8fafc');
      bodyGrad.addColorStop(0.5, '#cbd5e1');
      bodyGrad.addColorStop(1, '#94a3b8');
      
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(40, 0); // Pointy Nose
      ctx.bezierCurveTo(20, -8, 0, -10, -20, -8); // Top curve
      ctx.lineTo(-30, -15); // Tail fin top
      ctx.lineTo(-25, 0); // Exhaust
      ctx.lineTo(-30, 15); // Tail fin bottom
      ctx.bezierCurveTo(-20, 8, 0, 10, 20, 8); // Bottom curve
      ctx.closePath();
      ctx.fill();

      // Cockpit Canopy
      const canopyGrad = ctx.createLinearGradient(0, -8, 0, -2);
      canopyGrad.addColorStop(0, '#0ea5e9');
      canopyGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = canopyGrad;
      ctx.beginPath();
      ctx.moveTo(15, -4);
      ctx.bezierCurveTo(10, -10, -5, -10, -10, -4);
      ctx.closePath();
      ctx.fill();
      
      // Canopy highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, -6);
      ctx.lineTo(0, -8);
      ctx.stroke();

      // Wings (Swept back)
      const wingGrad = ctx.createLinearGradient(0, -30, 0, 30);
      wingGrad.addColorStop(0, '#e2e8f0');
      wingGrad.addColorStop(0.5, '#94a3b8');
      wingGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = wingGrad;
      
      // Top wing
      ctx.beginPath();
      ctx.moveTo(5, -2);
      ctx.lineTo(-10, -35);
      ctx.lineTo(-20, -35);
      ctx.lineTo(-10, -2);
      ctx.closePath();
      ctx.fill();
      
      // Bottom wing
      ctx.beginPath();
      ctx.moveTo(5, 2);
      ctx.lineTo(-10, 35);
      ctx.lineTo(-20, 35);
      ctx.lineTo(-10, 2);
      ctx.closePath();
      ctx.fill();

      // Engine Glow (Clean blue)
      const enginePulse = Math.sin(frameCount * 0.4) * 3;
      const engineGrad = ctx.createRadialGradient(-25, 0, 0, -25, 0, 20 + enginePulse);
      engineGrad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
      engineGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.3)');
      engineGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = engineGrad;
      ctx.beginPath();
      ctx.arc(-25, 0, 20 + enginePulse, 0, Math.PI * 2);
      ctx.fill();

      // Engine Core
      ctx.fillStyle = '#f0f9ff';
      ctx.beginPath();
      ctx.arc(-25, 0, 4 + enginePulse * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Plane Side Shading
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(25, 0);
      ctx.lineTo(-5, 8);
      ctx.lineTo(-10, 0);
      ctx.closePath();
      ctx.fill();

      // Wings
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(-10, -25);
      ctx.lineTo(-15, -25);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(-10, 25);
      ctx.lineTo(-15, 25);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = 'transparent';

      // Engine glow
      if (audioController.isSinging) {
        ctx.shadowColor = '#06b6d4'; // cyan
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(-12, 0, 5 + Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // UI drawing code removed from canvas as per UI overhaul
      // All HUD elements are now rendered via the GameHUD React component

      const isPerfectOverall = audioController.isSinging && audioController.currentNote !== '--' && Math.abs(audioController.currentCents) < 15;
      
      if (feedbackTimer > 0) feedbackTimer--;

      // Check for gate pass feedback
      const lastPassedObstacle = obstacles.find(o => o.passed && o.passedFrame === frameCount);
      if (lastPassedObstacle) {
        currentFeedback = "PERFECT!";
        feedbackTimer = 60;
      }

      // Update HUD state once per frame
      setHudData({
        score,
        highScore: parseInt(localStorage.getItem('highScore') || '0', 10),
        combo,
        comboMultiplier,
        perfectStreak,
        currentNote: audioController.currentNote,
        cents: audioController.currentCents,
        isSinging: audioController.isSinging,
        isPerfect: isPerfectOverall,
        lyrics: song ? song.sequence.slice(obstaclesPassed, obstaclesPassed + 6).map(s => s.word) : [],
        breathProgress: DIFFICULTY_PARAMS[difficulty].breathPenaltyThreshold ? silenceFrames / DIFFICULTY_PARAMS[difficulty].breathPenaltyThreshold : 0,
        isDying,
        trackTitle: song ? song.title : '',
        themeName: theme.name,
        pitchY: (playerY / canvas.height),
        volume: audioController.volume,
        dynamicDifficulty,
        feedbackMessage: feedbackTimer > 0 ? currentFeedback : undefined
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    const handleTouch = (e: TouchEvent) => {
      if (isPausedRef.current) return;
      
      // Resume audio context on touch (required for some mobile browsers)
      audioController.resume();
    };

    const handleTouchEnd = () => {
      // No-op
    };

    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateCanvasSize);
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [audioController, onGameOver, onCheckpointReached, difficulty, song, initialCheckpoint, level]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 overflow-hidden">
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain touch-none"
        />
        
        {/* Modern React HUD Overlay */}
        <GameHUD {...hudData} />

        {showOrientationWarning && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-white p-6 text-center z-50">
            <div className="animate-bounce mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Please Rotate Your Device</h3>
            <p className="text-slate-400">Vocal Flight is best played in landscape mode.</p>
          </div>
        )}
      </div>
    </div>
  );
};
