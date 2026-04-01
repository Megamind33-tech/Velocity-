import React from 'react';
import { Pause, Play, Home, Mic } from 'lucide-react';
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

        {/* ── PROFESSIONAL GAMING HUD OVERLAY ── */}
        <div className="hud-overlay flex flex-col px-4 py-3">
          {/* TOP HUD: Song Info + Pause Button */}
          <div className="flex items-center justify-between gap-3 pointer-events-none">
            {/* Song Info — Glass effect professional HUD style */}
            <div
              className="glass-sm flex items-center gap-2 px-3 py-2 rounded-lg pointer-events-auto transition-all hover:border-[var(--border-default)]"
            >
              <Mic className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0 animate-pulse" />
              <div className="min-w-0">
                <div className="text-[11px] font-black text-primary truncate max-w-[140px] leading-tight">
                  {song?.title ?? 'Endless Run'}
                </div>
                <div
                  className="text-[9px] font-bold uppercase tracking-wider mt-0.5 leading-none"
                  style={{ color: dc.text, textShadow: `0 0 8px ${dc.glow}` }}
                >
                  {difficulty} Mode
                </div>
              </div>
            </div>

            {/* Pause Button — Professional gaming button */}
            <button
              onClick={onPauseToggle}
              className="pointer-events-auto btn btn-ghost btn-icon-lg rounded-lg transition-all hover:bg-[var(--bg-surface-elevated)]"
            >
              {isPaused
                ? <Play className="w-5 h-5 text-[var(--color-primary)]" />
                : <Pause className="w-5 h-5 text-secondary" />
              }
            </button>
          </div>

          {/* BOTTOM HUD: Vocal Status Indicator */}
          <div className="mt-auto flex flex-col items-center gap-2 pointer-events-none">
            {/* Vocal Active Indicator */}
            <div
              className="glass-sm flex items-center gap-2 px-4 py-2.5 rounded-full"
            >
              <div
                className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"
                style={{ boxShadow: '0 0 8px rgba(67,231,255,0.8)' }}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
                {isPaused ? 'Paused' : 'Singing...'}
              </span>
            </div>

            {/* Performance Hint */}
            <div className="text-[9px] text-tertiary font-bold uppercase tracking-wider">
              {isPaused ? 'Resume to continue' : 'Hit perfect notes for bonus points'}
            </div>
          </div>
        </div>

        {/* ── PROFESSIONAL PAUSE OVERLAY ── */}
        {isPaused && (
          <div
            className="absolute inset-0 flex items-center justify-center z-40 animate-fade-in"
            style={{ background: 'rgba(7,9,14,0.92)', backdropFilter: 'blur(20px)' }}
          >
            <div
              className="w-full max-w-sm mx-4 rounded-2xl p-6 flex flex-col gap-5 animate-scale-in"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
            >
              {/* Decorative glow orb */}
              <div
                className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(125,92,255,0.4), transparent 70%)' }}
              />

              {/* Header */}
              <div className="text-center space-y-2">
                <Pause className="w-8 h-8 mx-auto text-[var(--color-secondary)]" />
                <h3 className="font-display text-headline font-black uppercase tracking-tight text-primary">
                  Paused
                </h3>
                {song && (
                  <p className="text-caption text-secondary">{song.title}</p>
                )}
              </div>

              {/* Resume Button */}
              <PrimaryButton
                variant="violet"
                size="md"
                fullWidth
                onClick={onPauseToggle}
                icon={<Play className="w-4 h-4" />}
              >
                Resume
              </PrimaryButton>

              {/* Exit Button */}
              <SecondaryButton
                variant="default"
                size="md"
                fullWidth
                onClick={() => {
                  onPauseToggle();
                  onAbort();
                }}
                icon={<Home className="w-4 h-4" />}
              >
                Exit to Home
              </SecondaryButton>

              {/* Footer text */}
              <div className="text-center text-label text-tertiary">
                Progress Saved
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
