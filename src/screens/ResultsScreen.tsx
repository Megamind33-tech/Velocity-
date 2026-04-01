import React from 'react';
import { RotateCcw, Home, Trophy, Star, Zap, Target } from 'lucide-react';
import { SONGS } from '../lib/songs';
import { PlayerProfile } from '../lib/profile';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SecondaryButton } from '../components/ui/SecondaryButton';
import { ScoreDisplay } from '../components/ui/ScoreDisplay';

interface ResultsScreenProps {
  score: number;
  isWin: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  selectedSongId: string;
  checkpoint: { score: number; currentLyricIndex: number; obstaclesPassed: number } | null;
  profile: PlayerProfile | null;
  lastGameStats: { perfectGates: number; maxCombo: number } | null;
  onRetry: () => void;
  onRetryFromCheckpoint: () => void;
  onHome: () => void;
}

const DIFF_COLORS = {
  easy:   { text: '#B9FF66', bg: 'rgba(185,255,102,0.10)', border: 'rgba(185,255,102,0.25)', glow: 'rgba(185,255,102,0.35)' },
  medium: { text: '#FFC94A', bg: 'rgba(255,201,74,0.10)',  border: 'rgba(255,201,74,0.25)',  glow: 'rgba(255,201,74,0.35)' },
  hard:   { text: '#FF6B6B', bg: 'rgba(255,107,107,0.10)', border: 'rgba(255,107,107,0.25)', glow: 'rgba(255,107,107,0.35)' },
};

export function ResultsScreen({
  score,
  isWin,
  difficulty,
  selectedSongId,
  checkpoint,
  profile,
  lastGameStats,
  onRetry,
  onRetryFromCheckpoint,
  onHome,
}: ResultsScreenProps) {
  const song = SONGS.find(s => s.id === selectedSongId);
  const dc = DIFF_COLORS[difficulty];
  const scoreKey = song ? `${song.id}_${song.difficulty}` : null;
  const previousBest = scoreKey ? (profile?.highScores[scoreKey] ?? 0) : 0;
  const isNewBest = score > previousBest && previousBest > 0;

  const winGlow  = 'rgba(185,255,102,0.4)';
  const failGlow = 'rgba(255,107,107,0.4)';
  const statusGlow = isWin ? winGlow : failGlow;

  return (
    <div
      className="game-screen flex flex-col items-center overflow-hidden animate-fade-in"
      style={{
        background: isWin
          ? 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(185,255,102,0.08) 0%, transparent 65%), var(--bg-primary)'
          : 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(255,107,107,0.08) 0%, transparent 65%), var(--bg-primary)',
      }}
    >
      <div className="game-screen-scroll w-full max-w-lg mx-auto px-4 pb-8 flex flex-col items-center">

        {/* ── Status headline ── */}
        <div className="pt-10 pb-6 text-center">
          {isWin ? (
            <Trophy
              className="w-14 h-14 mx-auto mb-4"
              style={{ color: '#B9FF66', filter: `drop-shadow(0 0 16px ${winGlow})` }}
            />
          ) : (
            <Zap
              className="w-14 h-14 mx-auto mb-4"
              style={{ color: '#FF6B6B', filter: `drop-shadow(0 0 16px ${failGlow})` }}
            />
          )}
          <h2
            className="font-display text-4xl font-black uppercase tracking-tight leading-none"
            style={{
              color: isWin ? '#B9FF66' : '#FF6B6B',
              textShadow: `0 0 32px ${statusGlow}`,
            }}
          >
            {isWin ? 'Stage Clear' : 'Run Ended'}
          </h2>
          <p className="text-sm text-[#4A5068] font-bold uppercase tracking-widest mt-2">
            {song?.title ?? 'Endless Run'} · {difficulty}
          </p>
        </div>

        {/* ── Professional Score Card ── */}
        <div
          className={`w-full rounded-2xl p-8 mb-6 relative overflow-hidden card ${isWin ? 'surface-success' : 'surface-danger'}`}
          style={{ borderColor: isWin ? 'rgba(185,255,102,0.3)' : 'rgba(255,107,107,0.3)' }}
        >
          {/* Decorative corner glow */}
          <div
            className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${statusGlow}, transparent 70%)` }}
          />

          {/* Final Score Display */}
          <div className="text-center mb-6">
            <div className="text-label text-tertiary mb-2">Final Score</div>
            <div
              className="font-display text-7xl font-black text-center leading-none score-display"
              style={{
                color: isWin ? 'var(--color-success)' : 'var(--color-danger)',
                textShadow: `0 0 40px ${statusGlow}`,
              }}
            >
              {score.toLocaleString()}
            </div>
          </div>

          {/* New Personal Best Badge */}
          {isNewBest && (
            <div className="flex justify-center mb-4">
              <span className="badge-warning text-xs font-black flex items-center gap-1.5">
                <Star className="w-3 h-3" /> New Personal Best!
              </span>
            </div>
          )}

          {/* Professional Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-[var(--border-subtle)]">
            {/* Status */}
            <div className="text-center">
              <div className="text-label text-tertiary mb-2">Status</div>
              <div
                className="text-headline font-black uppercase"
                style={{ color: isWin ? 'var(--color-success)' : 'var(--color-danger)' }}
              >
                {isWin ? 'Clear' : 'Failed'}
              </div>
            </div>

            {/* Difficulty */}
            <div className="text-center">
              <div className="text-label text-tertiary mb-2">Difficulty</div>
              <div className="text-headline font-black uppercase" style={{ color: dc.text }}>
                {difficulty}
              </div>
            </div>

            {/* Perfect Gates */}
            {lastGameStats && lastGameStats.perfectGates > 0 && (
              <div className="text-center">
                <div className="text-label text-tertiary mb-2">Perfect Notes</div>
                <div className="text-headline font-black text-[var(--color-primary)]">
                  {lastGameStats.perfectGates}
                </div>
              </div>
            )}

            {/* Best Combo */}
            {lastGameStats && lastGameStats.maxCombo > 0 && (
              <div className="text-center">
                <div className="text-label text-tertiary mb-2">Max Combo</div>
                <div className="text-headline font-black text-[var(--color-secondary)]">
                  x{lastGameStats.maxCombo}
                </div>
              </div>
            )}

            {/* Personal Best */}
            {previousBest > 0 && (
              <div className="text-center col-span-2">
                <div className="text-label text-tertiary mb-2">Personal Best</div>
                <div className="text-headline font-black text-secondary score-display">
                  {previousBest.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="w-full space-y-3">
          {/* Primary: retry or new run */}
          <PrimaryButton
            variant={isWin ? 'success' : 'cyan'}
            size="lg"
            fullWidth
            onClick={onRetry}
            icon={<RotateCcw className="w-5 h-5" />}
          >
            {isWin ? 'Play Again' : 'Retry Run'}
          </PrimaryButton>

          {/* Checkpoint retry */}
          {checkpoint && !isWin && (
            <PrimaryButton
              variant="amber"
              size="md"
              fullWidth
              onClick={onRetryFromCheckpoint}
              icon={<Target className="w-4 h-4" />}
            >
              Retry from Checkpoint
            </PrimaryButton>
          )}

          {/* Home */}
          <SecondaryButton
            variant="default"
            size="md"
            fullWidth
            onClick={onHome}
            icon={<Home className="w-4 h-4" />}
          >
            Back to Home
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
