import React from 'react';
import { Pause, Play, Home, Mic } from 'lucide-react';
import { GameEngine, GameStats } from '../components/GameEngine';
import { AudioController } from '../lib/audio';
import { Song } from '../lib/songs-extended';
import { PlayerProfile } from '../lib/profile';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SecondaryButton } from '../components/ui/SecondaryButton';

interface GameScreenProps {
  audioController: AudioController;
  song: Song | null;
  level: number;
  mode: 'A' | 'C';
  difficulty: 'novice' | 'intermediate' | 'advanced' | 'master' | 'legend';
  isPaused: boolean;
  profile: PlayerProfile | null;
  demoMode?: boolean;
  onPauseToggle: () => void;
  onGameOver: (score: number, win: boolean, stats?: GameStats) => void;
  onAbort: () => void;
}

export function GameScreen({
  audioController,
  song,
  level,
  mode,
  difficulty,
  isPaused,
  profile,
  demoMode,
  onPauseToggle,
  onGameOver,
  onAbort,
}: GameScreenProps) {

  const DIFF_COLORS: Record<string, { text: string; glow: string }> = {
    novice:       { text: '#B9FF66', glow: 'rgba(185,255,102,0.4)' },
    intermediate: { text: '#FFC94A', glow: 'rgba(255,201,74,0.4)' },
    advanced:     { text: '#FF6B6B', glow: 'rgba(255,107,107,0.4)' },
    master:       { text: '#7D5CFF', glow: 'rgba(125,92,255,0.4)' },
    legend:       { text: '#43E7FF', glow: 'rgba(67,231,255,0.4)' },
  };
  const dc = DIFF_COLORS[difficulty] || DIFF_COLORS.novice;

  return (
    <div
      className="fixed inset-0 mg-stage flex flex-col overflow-hidden"
      style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="mg-kit-layer mg-kit-layer--stage mg-kit-layer--subtle" aria-hidden />
      <div className="mg-vignette" aria-hidden />
      <div className="mg-scanlines" aria-hidden />
      <div className="flex-1 relative overflow-hidden z-[3]">
        <GameEngine
          audioController={audioController}
          song={song}
          level={level}
          mode={mode}
          difficulty={difficulty}
          isPaused={isPaused}
          demoMode={demoMode}
          onGameOver={onGameOver}
        />

        {/* HUD Overlay */}
        <div className="hud-overlay flex flex-col px-3 py-3 z-[60]">
          <div className="flex items-center justify-between gap-3 pointer-events-none">
            <div className="mg-hud-chip pointer-events-auto max-w-[min(72vw,280px)]">
              <Mic className="w-4 h-4 text-[#43E7FF] shrink-0 animate-pulse" />
              <div className="min-w-0">
                <div className="text-[10px] font-black text-white truncate leading-tight">
                  {song?.title ?? 'Endless Run'}
                </div>
                <div
                  className="mg-hud-label !text-[8px] !mt-0.5"
                  style={{ color: dc.text, textShadow: `0 0 8px ${dc.glow}` }}
                >
                  {difficulty} · Lv {level} · {mode}
                </div>
              </div>
            </div>

            <button
              onClick={onPauseToggle}
              className="pointer-events-auto mg-icon-btn"
              aria-label={isPaused ? 'Resume' : 'Pause'}
              style={{ width: 48, height: 48 }}
            >
              {isPaused
                ? <Play className="w-5 h-5 text-[#2A3080]" />
                : <Pause className="w-5 h-5 text-[#2A3080]" />
              }
            </button>
          </div>

          {/* Bottom: Vocal Status */}
          <div className="mt-auto flex flex-col items-center gap-2 pointer-events-none pb-2">
            <div className="mg-hud-chip rounded-full px-5 py-2">
              <div
                className="w-2 h-2 rounded-full bg-[#43E7FF] animate-pulse"
                style={{ boxShadow: '0 0 8px rgba(67,231,255,0.8)' }}
              />
              <span
                className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#43E7FF]"
                style={{ fontFamily: 'var(--font-game, Orbitron, sans-serif)' }}
              >
                {isPaused ? 'Paused' : 'Live'}
              </span>
            </div>
            <div className="text-[9px] text-[#6B85B0] font-bold uppercase tracking-wider">
              {isPaused ? 'Tap resume' : 'Nail perfect gates for bonus'}
            </div>
          </div>
        </div>

        {/* Pause Overlay */}
        {isPaused && (
          <div
            className="absolute inset-0 flex items-center justify-center z-40 animate-fade-in"
            style={{ background: 'rgba(8,10,35,0.92)', backdropFilter: 'blur(20px)' }}
          >
            <div className="w-full max-w-sm mx-4 mg-panel flex flex-col gap-5 !animate-none">
              <div
                className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(60,120,255,0.35), transparent 70%)' }}
              />
              <div className="text-center space-y-2">
                <Pause className="w-8 h-8 mx-auto text-[#80c8ff]" />
                <h3
                  className="text-headline font-black uppercase tracking-tight text-white"
                  style={{ fontFamily: 'var(--font-game, Orbitron, sans-serif)' }}
                >
                  Paused
                </h3>
                {song && <p className="text-caption text-[#8BA0C8]">{song.title}</p>}
              </div>
              <PrimaryButton variant="gold" size="md" fullWidth onClick={onPauseToggle} icon={<Play className="w-4 h-4" />}>
                Resume
              </PrimaryButton>
              <SecondaryButton
                variant="default" size="md" fullWidth
                onClick={() => { onPauseToggle(); onAbort(); }}
                icon={<Home className="w-4 h-4" />}
              >
                Exit to Home
              </SecondaryButton>
              <div className="text-center text-label text-[#6B85B0]">Progress Saved</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
