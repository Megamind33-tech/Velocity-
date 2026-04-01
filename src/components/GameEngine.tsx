import React, { useEffect, useRef, useCallback } from 'react';
import { AudioController } from '../lib/audio';
import { Song } from '../lib/songs-extended';
import { getLevelInfo } from '../lib/progression';
import { getAircraftById } from '../lib/aircraft';

interface GameEngineProps {
  audioController: AudioController;
  song: Song | null;
  level: number;
  mode: 'A' | 'C';
  difficulty: 'novice' | 'intermediate' | 'advanced' | 'master' | 'legend';
  isPaused: boolean;
  demoMode?: boolean;
  aircraftId?: string;
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
  xpEarned: number;
}

interface WaypointData {
  noteNum: number;
  time: number;
  duration: number;
  x: number;
  y: number;
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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface BgStar {
  x: number;
  y: number;
  size: number;
  brightness: number;
  speed: number;
}

function generateNoteSequence(song: Song, level: number): number[] {
  const { minNote, maxNote, bpm, duration } = song;
  const noteRange = maxNote - minNote;
  const levelInfo = getLevelInfo(level);
  const tempo = levelInfo?.tempo || 100;
  const beatsPerSecond = (bpm * (tempo / 100)) / 60;
  const noteCount = Math.max(8, Math.min(Math.floor(beatsPerSecond * duration), Math.floor(duration / 1.5)));

  const keyNote = minNote + Math.floor(noteRange / 2);
  const scaleSteps = [0, 2, 4, 5, 7, 9, 11];
  const baseScaleNotes: number[] = [];
  for (let oct = -1; oct <= 2; oct++) {
    for (const step of scaleSteps) {
      const note = keyNote + step + (oct * 12);
      if (note >= minNote && note <= maxNote) baseScaleNotes.push(note);
    }
  }
  if (baseScaleNotes.length === 0) {
    for (let n = minNote; n <= maxNote; n++) baseScaleNotes.push(n);
  }

  let seed = song.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + level * 137;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed % 1000) / 1000; };

  const notes: number[] = [];
  let idx = Math.floor(baseScaleNotes.length / 2);
  for (let i = 0; i < noteCount; i++) {
    notes.push(baseScaleNotes[idx]);
    idx = Math.max(0, Math.min(baseScaleNotes.length - 1, idx + Math.floor(rand() * 5) - 2));
  }
  return notes;
}

function makeWaypoints(song: Song, seq: number[], level: number, w: number, h: number): WaypointData[] {
  const nr = (song.maxNote - song.minNote) || 1;
  return seq.map((noteNum, i) => {
    const tf = (i + 0.5) / seq.length;
    return {
      noteNum, time: tf * song.duration,
      duration: (song.duration / seq.length) * 0.8,
      x: tf * w,
      y: h - ((noteNum - song.minNote) / nr) * (h * 0.8) - h * 0.1,
      hitAccuracy: 0, passed: false, hit: false,
    };
  });
}

function makeContour(song: Song, seq: number[], w: number, h: number): ContourPoint[] {
  const nr = (song.maxNote - song.minNote) || 1;
  return seq.map((noteNum, i) => {
    const tf = (i + 0.5) / seq.length;
    return { x: tf * w, y: h - ((noteNum - song.minNote) / nr) * (h * 0.8) - h * 0.1, noteNum, time: tf * song.duration };
  });
}

function createStars(w: number, h: number): BgStar[] {
  const stars: BgStar[] = [];
  for (let i = 0; i < 120; i++) {
    stars.push({
      x: Math.random() * w, y: Math.random() * h,
      size: Math.random() * 1.5 + 0.5,
      brightness: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.3 + 0.1,
    });
  }
  return stars;
}

const DIFF_GLOW: Record<string, string> = {
  novice: '185,255,102', intermediate: '255,201,74',
  advanced: '255,107,107', master: '125,92,255', legend: '67,231,255',
};

export function GameEngine({
  audioController, song, level, mode, difficulty, isPaused, demoMode, aircraftId, onGameOver,
}: GameEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    phase: 'countdown' | 'playing' | 'ended';
    countdownLeft: number;
    elapsed: number;
    score: number; combo: number; maxCombo: number;
    accSum: number; hitCount: number; missCount: number; totalChecked: number;
    lastPitch: number; pitchHistory: number[];
    waypoints: WaypointData[]; contour: ContourPoint[]; seq: number[];
    trail: { x: number; y: number; a: number }[];
    particles: Particle[]; stars: BgStar[];
    lastFrame: number;
    demoAngle: number; demoNoteIdx: number;
  } | null>(null);
  const overRef = useRef(onGameOver);
  overRef.current = onGameOver;

  const resetState = useCallback(() => {
    if (!canvasRef.current || !song) return;
    const c = canvasRef.current;
    const seq = generateNoteSequence(song, level);
    stateRef.current = {
      phase: 'countdown', countdownLeft: 3,
      elapsed: 0, score: 0, combo: 0, maxCombo: 0,
      accSum: 0, hitCount: 0, missCount: 0, totalChecked: 0,
      lastPitch: 0, pitchHistory: [],
      waypoints: mode === 'A' ? makeWaypoints(song, seq, level, c.width, c.height) : [],
      contour: mode === 'C' ? makeContour(song, seq, c.width, c.height) : [],
      seq, trail: [], particles: [], stars: createStars(c.width, c.height),
      lastFrame: 0, demoAngle: 0, demoNoteIdx: 0,
    };
  }, [song, level, mode]);

  useEffect(() => { resetState(); }, [resetState]);

  useEffect(() => {
    if (!canvasRef.current || !song) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!stateRef.current) resetState();
    const S = () => stateRef.current!;

    let raf = 0;

    const tick = () => {
      const s = S();
      if (!s) { raf = requestAnimationFrame(tick); return; }
      const now = Date.now();
      if (s.lastFrame === 0) s.lastFrame = now;
      const dt = Math.min((now - s.lastFrame) / 1000, 0.1);
      s.lastFrame = now;

      const W = canvas.width, H = canvas.height;
      const nr = (song.maxNote - song.minNote) || 1;
      const levelInfo = getLevelInfo(level);
      const hz = levelInfo?.hitZones ?? 2;

      // --- Background ---
      ctx.fillStyle = '#07090E';
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (const st of s.stars) {
        st.x -= st.speed;
        if (st.x < 0) { st.x = W; st.y = Math.random() * H; }
        const flicker = st.brightness + Math.sin(now * 0.003 + st.x) * 0.15;
        ctx.fillStyle = `rgba(200,220,255,${Math.max(0, flicker)})`;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Altitude grid
      const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
      ctx.strokeStyle = 'rgba(67,231,255,0.08)';
      ctx.lineWidth = 1;
      ctx.font = '10px "Inter",sans-serif';
      ctx.fillStyle = 'rgba(184,191,212,0.2)';
      ctx.textAlign = 'right';
      for (let i = 0; i <= nr; i += 2) {
        const y = H - (i / nr) * (H * 0.8) - H * 0.1;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        const nn = song.minNote + i;
        ctx.fillText(`${noteNames[nn % 12]}${Math.floor(nn / 12)}`, W - 5, y + 3);
      }

      // --- Countdown ---
      if (s.phase === 'countdown') {
        s.countdownLeft -= dt;
        if (s.countdownLeft <= 0) {
          s.phase = 'playing';
        } else {
          const num = Math.ceil(s.countdownLeft);
          const scale = 1 + (s.countdownLeft % 1) * 0.3;
          ctx.save();
          ctx.translate(W / 2, H / 2);
          ctx.scale(scale, scale);
          ctx.fillStyle = '#43E7FF';
          ctx.font = 'bold 72px "Space Grotesk",sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(num), 0, 0);
          ctx.font = 'bold 16px "Space Grotesk",sans-serif';
          ctx.fillStyle = '#A7B0C6';
          ctx.fillText('GET READY', 0, 50);
          ctx.restore();
          if (demoMode) {
            ctx.fillStyle = 'rgba(125,92,255,0.6)';
            ctx.font = 'bold 14px "Space Grotesk",sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('DEMO MODE — auto-pilot playing', W / 2, H / 2 + 90);
          }
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      // --- Playing ---
      if (!isPaused && s.phase === 'playing') s.elapsed += dt;

      // Audio / demo pitch
      let pitch = 0;
      let singing = false;
      if (demoMode) {
        const target = mode === 'A' ? s.waypoints : s.contour.map(c => ({ noteNum: c.noteNum, time: c.time, duration: 1 }));
        let tgt: number | null = null;
        for (const wp of target) {
          const t = 'time' in wp ? wp.time : 0;
          const d = 'duration' in wp ? wp.duration : 1;
          if (s.elapsed >= t - 0.5 && s.elapsed <= t + d + 0.5) { tgt = wp.noteNum; break; }
        }
        if (tgt !== null) {
          const wobble = Math.sin(s.demoAngle) * 0.15;
          s.demoAngle += dt * 8;
          pitch = 440 * Math.pow(2, (tgt + wobble - 69) / 12);
          singing = true;
        }
      } else {
        audioController.update();
        pitch = audioController.pitch;
        singing = audioController.isSinging;
      }

      if (singing && pitch > 0) {
        s.lastPitch = pitch;
        s.pitchHistory.push(pitch);
        if (s.pitchHistory.length > 100) s.pitchHistory.shift();
      }

      let planeY = H / 2;
      let accurate = false;
      let pAngle = 0;
      const curNote = (singing && pitch > 0) ? 12 * Math.log2(pitch / 440) + 69 : -1;

      if (curNote > 0) {
        planeY = H - ((curNote - song.minNote) / nr) * (H * 0.8) - H * 0.1;
        planeY = Math.max(20, Math.min(H - 20, planeY));
        if (s.pitchHistory.length >= 2) {
          const prev = s.pitchHistory[s.pitchHistory.length - 2];
          pAngle = Math.max(-15, Math.min(15, (pitch - prev) * 0.3));
        }

        if (mode === 'A' && !isPaused) {
          for (const wp of s.waypoints) {
            if (wp.passed || wp.hit) continue;
            if (s.elapsed >= wp.time && s.elapsed <= wp.time + wp.duration) {
              const d = Math.abs(curNote - wp.noteNum);
              if (d <= hz) {
                const a = Math.max(0, 100 - (d * 100 / hz));
                wp.hit = true; wp.hitAccuracy = a;
                s.hitCount++; s.accSum += a; s.combo++;
                s.maxCombo = Math.max(s.maxCombo, s.combo);
                const cm = 1 + Math.floor(s.combo / 5) * 0.25;
                s.score += Math.floor(a * 10 * cm);
                accurate = true;
                spawnParticles(s.particles, wp.x, wp.y, a >= 90);
              }
            }
          }
          for (const wp of s.waypoints) {
            if (!wp.passed && !wp.hit && s.elapsed > wp.time + wp.duration) {
              wp.passed = true; s.missCount++; s.combo = 0;
            }
          }
        }

        if (mode === 'C' && !isPaused && s.contour.length > 0) {
          let near = s.contour[0];
          let md = Infinity;
          for (const pt of s.contour) {
            const d = Math.abs(pt.time - s.elapsed);
            if (d < md) { md = d; near = pt; }
          }
          const d = Math.abs(curNote - near.noteNum);
          if (d <= hz) {
            const a = Math.max(0, 100 - (d * 100 / hz));
            s.hitCount++; s.accSum += a; s.combo++;
            s.maxCombo = Math.max(s.maxCombo, s.combo);
            s.score += Math.floor(a * 0.5 * (1 + Math.floor(s.combo / 5) * 0.25));
            accurate = true;
          } else if (d > hz * 2) { s.missCount++; s.combo = 0; }
          s.totalChecked++;
        }
      } else if (!isPaused && s.phase === 'playing') {
        if (mode === 'A') {
          for (const wp of s.waypoints) {
            if (!wp.passed && !wp.hit && s.elapsed > wp.time + wp.duration) {
              wp.passed = true; s.missCount++; s.combo = 0;
            }
          }
        }
      }

      // --- Draw waypoints/contour ---
      const pps = W / song.duration;
      const scrollX = s.elapsed * pps;

      if (mode === 'A') {
        for (const wp of s.waypoints) {
          const sx = wp.x - scrollX + 100;
          if (sx < -60 || sx > W + 60) continue;
          if (s.elapsed < wp.time - 5 || s.elapsed > wp.time + wp.duration + 2) continue;

          let col: string, r: number;
          if (wp.hit) {
            col = `rgba(185,255,102,${0.3 + wp.hitAccuracy / 300})`;
            r = 12;
          } else if (wp.passed) {
            col = 'rgba(255,107,107,0.25)'; r = 8;
          } else if (s.elapsed >= wp.time && s.elapsed <= wp.time + wp.duration) {
            col = 'rgba(255,201,74,0.9)'; r = 20;
            ctx.beginPath(); ctx.arc(sx, wp.y, r + 8, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,201,74,0.3)'; ctx.lineWidth = 2; ctx.stroke();
          } else {
            col = 'rgba(125,92,255,0.5)'; r = 14;
          }

          ctx.beginPath(); ctx.arc(sx, wp.y, r, 0, Math.PI * 2);
          ctx.fillStyle = col; ctx.fill();

          if (!wp.hit && !wp.passed) {
            const hitR = hz * (H * 0.8 / nr);
            ctx.beginPath(); ctx.arc(sx, wp.y, hitR, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(125,92,255,0.12)'; ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
          }
        }

        // connecting line between upcoming waypoints
        ctx.strokeStyle = 'rgba(125,92,255,0.15)'; ctx.lineWidth = 1;
        ctx.beginPath();
        let first = true;
        for (const wp of s.waypoints) {
          const sx = wp.x - scrollX + 100;
          if (sx < -60 || sx > W + 60) continue;
          if (wp.hit || wp.passed) continue;
          if (first) { ctx.moveTo(sx, wp.y); first = false; }
          else ctx.lineTo(sx, wp.y);
        }
        ctx.stroke();
      }

      if (mode === 'C' && s.contour.length > 1) {
        // hit zone band
        ctx.strokeStyle = `rgba(${DIFF_GLOW[difficulty] || '125,92,255'},0.12)`;
        ctx.lineWidth = hz * 2 * (H * 0.8 / nr);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); let started = false;
        for (const pt of s.contour) {
          const sx = pt.x - scrollX + 100;
          if (sx < -100 || sx > W + 100) continue;
          if (!started) { ctx.moveTo(sx, pt.y); started = true; } else ctx.lineTo(sx, pt.y);
        }
        ctx.stroke();

        // main contour line
        ctx.strokeStyle = '#7D5CFF'; ctx.lineWidth = 3;
        ctx.beginPath(); started = false;
        for (const pt of s.contour) {
          const sx = pt.x - scrollX + 100;
          if (sx < -100 || sx > W + 100) continue;
          if (!started) { ctx.moveTo(sx, pt.y); started = true; } else ctx.lineTo(sx, pt.y);
        }
        ctx.stroke(); ctx.lineWidth = 1;
      }

      // --- Particles ---
      s.particles = s.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= dt;
        if (p.life <= 0) return false;
        const a = p.life / p.maxLife;
        ctx.fillStyle = p.color.replace('1)', `${a})`);
        ctx.beginPath(); ctx.arc(p.x - scrollX + 100, p.y, p.size * a, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      // --- Player trail ---
      if (singing && pitch > 0) s.trail.push({ x: 100, y: planeY, a: 1 });
      s.trail = s.trail.map(p => ({ ...p, x: p.x - 0.8, a: p.a - 0.015 })).filter(p => p.a > 0 && p.x > 0);
      if (s.trail.length > 1) {
        ctx.beginPath(); ctx.moveTo(s.trail[0].x, s.trail[0].y);
        for (let i = 1; i < s.trail.length; i++) ctx.lineTo(s.trail[i].x, s.trail[i].y);
        ctx.strokeStyle = accurate ? 'rgba(67,231,255,0.35)' : 'rgba(180,180,200,0.15)';
        ctx.lineWidth = 2; ctx.stroke();
      }

      // --- Aircraft ---
      {
        const aircraft = getAircraftById(aircraftId || 'heli-classic');
        const glowRgb = DIFF_GLOW[difficulty] || '67,231,255';
        const gameTime = s.elapsed;
        ctx.save();
        ctx.translate(100, planeY);
        aircraft.draw(ctx, pAngle, accurate, glowRgb, gameTime);
        ctx.restore();
      }

      // --- HUD ---
      const acc = s.hitCount > 0 ? s.accSum / s.hitCount : 0;
      drawHUD(ctx, W, H, singing ? pitch : 0, acc, s.score, s.combo, s.elapsed, song.duration, singing, demoMode);

      if (!isPaused && !singing && !demoMode && s.phase === 'playing') {
        ctx.fillStyle = 'rgba(255,107,107,0.7)';
        ctx.font = 'bold 14px "Space Grotesk",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sing to fly the plane!', W / 2, H - 55);
      }

      // --- Game over ---
      if (s.elapsed >= song.duration && s.phase === 'playing') {
        s.phase = 'ended';
        const fa = s.hitCount > 0 ? s.accSum / s.hitCount : 0;
        const stars = fa >= 90 ? 3 : fa >= 75 ? 2 : fa >= 60 ? 1 : 0;
        const xp = Math.floor(s.score / 10) + stars * 50;
        overRef.current(s.score, fa >= 60, {
          accuracy: fa, maxCombo: s.maxCombo,
          notesHit: s.hitCount, notesMissed: s.missCount,
          smoothnessScore: 85, vibratoQuality: 0,
          playtime: s.elapsed, xpEarned: xp,
        });
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [audioController, song, level, mode, difficulty, isPaused, demoMode, resetState]);

  useEffect(() => {
    const resize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}
      style={{ display: 'block', background: '#07090E' }} />
  );
}

function spawnParticles(arr: Particle[], x: number, y: number, perfect: boolean) {
  const count = perfect ? 12 : 6;
  const color = perfect ? 'rgba(255,201,74,1)' : 'rgba(185,255,102,1)';
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const speed = 1.5 + Math.random() * 3;
    arr.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1,
      life: 0.6 + Math.random() * 0.4, maxLife: 1, color, size: 2 + Math.random() * 2,
    });
  }
}

function drawPlane(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, glow: boolean, diff: string) {
  ctx.save(); ctx.translate(x, y);
  const a = angle * Math.PI / 180;
  // Glow
  if (glow) {
    const rgb = DIFF_GLOW[diff] || '67,231,255';
    ctx.fillStyle = `rgba(${rgb},0.12)`;
    ctx.beginPath(); ctx.arc(0, 0, 55, 0, Math.PI * 2); ctx.fill();
  }
  // Body
  ctx.fillStyle = '#C0C0C0';
  ctx.beginPath(); ctx.ellipse(0, 0, 40, 8, a, 0, Math.PI * 2); ctx.fill();
  // Wings
  ctx.fillStyle = '#E8E8E8';
  ctx.beginPath(); ctx.ellipse(0, 0, 70, 4, a, 0, Math.PI * 2); ctx.fill();
  // Cockpit
  ctx.fillStyle = '#0047AB';
  ctx.beginPath(); ctx.arc(8, -4, 3, 0, Math.PI * 2); ctx.fill();
  // Outline glow
  ctx.strokeStyle = glow ? `rgba(${DIFF_GLOW[diff] || '67,231,255'},0.7)` : 'rgba(200,200,200,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 45, 12, a, 0, Math.PI * 2); ctx.stroke();
  // Tail
  ctx.fillStyle = '#B0B0B0';
  ctx.beginPath(); ctx.moveTo(-35, 0); ctx.lineTo(-42, -10); ctx.lineTo(-42, 10); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawHUD(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  pitch: number, acc: number, score: number, combo: number,
  elapsed: number, total: number, singing: boolean, demo?: boolean,
) {
  const p = 15;
  const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

  // Top-left
  ctx.font = 'bold 13px "Space Grotesk",sans-serif';
  ctx.textAlign = 'left';
  if (pitch > 0 && singing) {
    const nn = 12 * Math.log2(pitch / 440) + 69;
    ctx.fillStyle = '#F5F7FC';
    ctx.fillText(`NOTE: ${noteNames[Math.round(nn) % 12]}${Math.floor(Math.round(nn) / 12)}`, p, p + 20);
    ctx.fillText(`PITCH: ${pitch.toFixed(0)} Hz`, p, p + 38);
  } else {
    ctx.fillStyle = '#4A5068';
    ctx.fillText('NOTE: --', p, p + 20);
    ctx.fillText('PITCH: --', p, p + 38);
  }

  // Top-right
  ctx.textAlign = 'right'; ctx.fillStyle = '#F5F7FC';
  ctx.fillText(`ACCURACY: ${acc.toFixed(1)}%`, W - p, p + 20);
  ctx.fillText(`SCORE: ${score.toLocaleString()}`, W - p, p + 38);

  // Combo
  if (combo > 1) {
    ctx.fillStyle = combo >= 20 ? '#FF4FC3' : combo >= 10 ? '#FFC94A' : '#B9FF66';
    ctx.font = `bold ${Math.min(20, 14 + combo * 0.3)}px "Space Grotesk",sans-serif`;
    ctx.fillText(`${combo}x COMBO`, W - p, p + 58);
  }

  // Progress bar
  const barW = W - p * 2, barY = H - p - 22;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(p, barY, barW, 4);
  ctx.fillStyle = 'rgba(67,231,255,0.7)';
  ctx.fillRect(p, barY, barW * Math.min(1, elapsed / total), 4);

  // Bottom-left: time
  ctx.font = 'bold 13px "Space Grotesk",sans-serif';
  ctx.textAlign = 'left'; ctx.fillStyle = '#F5F7FC';
  const rem = Math.max(0, total - elapsed);
  ctx.fillText(`TIME: ${Math.floor(rem / 60)}:${Math.floor(rem % 60).toString().padStart(2, '0')}`, p, H - p);

  // Bottom-right: status
  ctx.textAlign = 'right';
  ctx.fillStyle = acc > 85 ? '#B9FF66' : acc > 60 ? '#FFC94A' : '#FF6B6B';
  ctx.fillText(acc > 85 ? 'ON COURSE' : acc > 60 ? 'ADJUSTING' : 'OFF COURSE', W - p, H - p);

  // Demo badge
  if (demo) {
    ctx.fillStyle = 'rgba(125,92,255,0.15)';
    const bw = 140, bh = 22, bx = W / 2 - bw / 2, by = p;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = 'rgba(125,92,255,0.4)'; ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#7D5CFF';
    ctx.font = 'bold 10px "Space Grotesk",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DEMO MODE', W / 2, by + 15);
  }
}

export default GameEngine;
