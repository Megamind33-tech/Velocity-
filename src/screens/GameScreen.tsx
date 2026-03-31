import React from 'react';
import { Pause, Play, X, RotateCcw, Home, Mic } from 'lucide-react';
import { GameCanvas } from '../components/GameCanvas';
import { AudioController } from '../lib/audio';
import { SONGS } from '../lib/songs';
import { PlayerProfile } from '../lib/profile';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SecondaryButton } from '../components/ui/SecondaryButton';

interface GameScreenProps {
  audioController: AudioController;
  difficulty: 'easy' | 'medium' | 'hard';
  selectedSongId: string;
  isPaused: boolean;
  checkpoint: { score: number; currentLyricIndex: number; obstaclesPassed: number } | null;
  profile: PlayerProfile | null;
  onPauseToggle: () => void;
  onGameOver: (score: number, win: boolean, stats?: { perfectGates: number; maxCombo: number }) => void;
  onCheckpointReached: (cp: { score: number; currentLyricIndex: number; obstaclesPassed: number }) => void;
  onAbort: () => void;
}

export function GameScreen({
  audioController,
  difficulty,
  selectedSongId,
  isPaused,
  checkpoint,
  profile,
  onPauseToggle,
  onGameOver,
  onCheckpointReached,
  onAbort,
}: GameScreenProps) {
  const song = SONGS.find(s => s.id === selectedSongId) ?? null;

  const DIFF_COLORS = {
    easy:   { text: '#B9FF66', glow: 'rgba(185,255,102,0.4)' },
    medium: { text: '#FFC94A', glow: 'rgba(255,201,74,0.4)' },
    hard:   { text: '#FF6B6B', glow: 'rgba(255,107,107,0.4)' },
  };
  const dc = DIFF_COLORS[difficulty];

  return (
    <div
      className="fixed inset-0 bg-[#07090E] flex flex-col overflow-hidden"
      style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}
    >
      {/* ── Game canvas ── fills all remaining space */}
      <div className="flex-1 relative overflow-hidden">
        <GameCanvas
          audioController={audioController}
          onGameOver={onGameOver}
          onCheckpointReached={onCheckpointReached}
          difficulty={difficulty}
          song={song}
          level={profile?.level ?? 1}
          isPaused={isPaused}
          initialCheckpoint={checkpoint}
        />

        {/* ── React HUD overlay ── */}
        <div className="hud-overlay flex flex-col">
          {/* Top HUD bar */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 pointer-events-none">
            {/* Song info */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(7,9,14,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Mic className="w-3 h-3 text-[#43E7FF] shrink-0" />
              <div className="min-w-0">
                <div className="text-[11px] font-black text-[#F5F7FC] truncate max-w-[120px] leading-none">
                  {song?.title ?? 'Endless Run'}
                </div>
                <div
                  className="text-[9px] font-bold uppercase tracking-wider mt-0.5 leading-none"
                  style={{ color: dc.text, textShadow: `0 0 8px ${dc.glow}` }}
                >
                  {difficulty}
                </div>
              </div>
            </div>

            {/* Pause button — pointer events on */}
            <button
              onClick={onPauseToggle}
              className="pointer-events-auto w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{
                background: 'rgba(7,9,14,0.80)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              {isPaused
                ? <Play className="w-5 h-5 text-[#43E7FF]" />
                : <Pause className="w-5 h-5 text-[#A7B0C6]" />
              }
            </button>
          </div>

          {/* Vocal active indicator bottom */}
          <div className="mt-auto flex justify-center pb-3 pointer-events-none">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(7,9,14,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(67,231,255,0.12)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#43E7FF] animate-pulse" style={{ boxShadow: '0 0 6px rgba(67,231,255,0.8)' }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#43E7FF]">
                Vocal Active — Sing to Perform
              </span>
            </div>
          </div>
        </div>

        {/* ── Pause Overlay ── */}
        {isPaused && (
          <div
            className="absolute inset-0 flex items-center justify-center z-40 anim-fade-in"
            style={{ background: 'rgba(7,9,14,0.88)', backdropFilter: 'blur(20px)' }}
          >
            <div
              className="w-full max-w-xs mx-4 rounded-3xl p-7 flex flex-col gap-4 anim-slide-up"
              style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Glow orb */}
              <div
                className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(125,92,255,0.3), transparent 70%)' }}
              />

              <div className="text-center space-y-1">
                <Pause className="w-8 h-8 mx-auto mb-2" style={{ color: '#7D5CFF' }} />
                <h3 className="font-display text-2xl font-black uppercase tracking-tight text-[#F5F7FC]">Paused</h3>
                {song && (
                  <p className="text-xs text-[#A7B0C6]">{song.title}</p>
                )}
              </div>

              <PrimaryButton variant="violet" size="md" fullWidth onClick={onPauseToggle}
                icon={<Play className="w-4 h-4" />}>
                Resume
              </PrimaryButton>

              <SecondaryButton variant="default" size="md" fullWidth onClick={() => {
                onPauseToggle();
                onAbort();
              }}
                icon={<Home className="w-4 h-4" />}
              >
                Exit to Home
              </SecondaryButton>

              <div className="text-center text-[10px] text-[#4A5068] font-bold uppercase tracking-widest">
                · Progress paused ·
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
