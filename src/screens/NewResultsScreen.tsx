import React, { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, Home, RefreshCw, ChevronRight, Zap, Award } from 'lucide-react';
import { Song } from '../lib/songs-extended';
import { getLevelInfo } from '../lib/progression';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { SecondaryButton } from '../components/ui/SecondaryButton';

interface NewResultsScreenProps {
  song: Song;
  level: number;
  mode: 'A' | 'C';
  score: number;
  accuracy: number;
  maxCombo: number;
  notesHit: number;
  notesMissed: number;
  previousBestScore: number;
  xpEarned?: number;
  onHome: () => void;
  onRetry: () => void;
  onNextLevel?: () => void;
}

export function NewResultsScreen({
  song, level, mode, score, accuracy, maxCombo,
  notesHit, notesMissed, previousBestScore,
  xpEarned, onHome, onRetry, onNextLevel,
}: NewResultsScreenProps) {
  const [stars, setStars] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    setStars(accuracy >= 90 ? 3 : accuracy >= 75 ? 2 : accuracy >= 60 ? 1 : 0);
    setIsNewRecord(score > previousBestScore && previousBestScore > 0);
  }, [accuracy, score, previousBestScore]);

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - pct, 3);
      setAnimatedScore(Math.floor(score * eased));
      if (pct < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const levelInfo = getLevelInfo(level);
  const passed = accuracy >= 60;
  const xp = xpEarned || Math.floor(score / 10) + stars * 50;

  const gradeColor = score >= 750 ? '#FFC94A' : accuracy >= 90 ? '#B9FF66' : accuracy >= 75 ? '#FFC94A' : '#FF6B6B';
  const gradeText = score >= 750 ? 'PERFECT FLIGHT!' : accuracy >= 90 ? 'EXCELLENT!' : accuracy >= 75 ? 'GOOD RUN!' : accuracy >= 60 ? 'CLEARED!' : 'TURBULENCE!';

  return (
    <div className="game-screen stage-bg flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 text-center border-b border-[var(--border-subtle)]">
        {passed ? (
          <Trophy className="w-14 h-14 mx-auto mb-3" style={{ color: gradeColor, filter: `drop-shadow(0 0 12px ${gradeColor}80)` }} />
        ) : (
          <Star className="w-14 h-14 text-[#FF6B6B] mx-auto mb-3" />
        )}
        <h1 className="text-display-lg font-black mb-1" style={{ color: gradeColor }}>
          {gradeText}
        </h1>
        <p className="text-secondary text-sm">{song.title} — {levelInfo?.name || `Level ${level}`}</p>
        <p className="text-tertiary text-xs mt-1">Mode {mode} · {song.difficulty}</p>
      </div>

      {/* Score + Stats */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {/* Score */}
        <div className="card bg-gradient-to-br from-[#43E7FF]/10 to-[#7D5CFF]/10 border-[var(--border-primary)] text-center py-5">
          <p className="text-label text-secondary mb-1">FINAL SCORE</p>
          <p className="text-display-xl font-black text-primary">{animatedScore.toLocaleString()}</p>
          {isNewRecord && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <Award className="w-4 h-4 text-[#FFC94A]" />
              <span className="text-sm font-black text-[#FFC94A]">NEW RECORD!</span>
            </div>
          )}
        </div>

        {/* Stars + XP */}
        <div className="flex gap-3">
          <div className="card flex-1 text-center py-4">
            <p className="text-label text-secondary mb-2">RATING</p>
            <div className="flex justify-center gap-2 mb-1">
              {[1, 2, 3].map((s) => (
                <Star key={s} className={`w-7 h-7 transition-all duration-300 ${s <= stars ? 'fill-[#FFC94A] text-[#FFC94A] scale-110' : 'text-[var(--border-default)]'}`} />
              ))}
            </div>
            <p className="text-caption text-tertiary mt-1">
              {stars === 3 ? 'Perfect!' : stars === 2 ? 'Great!' : stars === 1 ? 'Good!' : 'Try Again'}
            </p>
          </div>
          <div className="card flex-1 text-center py-4 bg-[rgba(125,92,255,0.08)]">
            <p className="text-label text-secondary mb-2">XP EARNED</p>
            <div className="flex items-center justify-center gap-1.5">
              <Zap className="w-5 h-5 text-[#7D5CFF]" />
              <span className="text-headline font-black text-[#7D5CFF]">+{xp}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="card bg-[rgba(67,231,255,0.06)] py-3">
            <p className="text-caption text-tertiary mb-0.5">ACCURACY</p>
            <p className="text-title font-black text-primary">{accuracy.toFixed(1)}%</p>
          </div>
          <div className="card bg-[rgba(185,255,102,0.06)] py-3">
            <p className="text-caption text-tertiary mb-0.5">MAX COMBO</p>
            <p className="text-title font-black text-success">{maxCombo}x</p>
          </div>
          <div className="card bg-[rgba(125,92,255,0.06)] py-3">
            <p className="text-caption text-tertiary mb-0.5">NOTES HIT</p>
            <p className="text-title font-black text-secondary">{notesHit}/{notesHit + notesMissed}</p>
          </div>
          <div className="card bg-[rgba(255,107,107,0.06)] py-3">
            <p className="text-caption text-tertiary mb-0.5">MISSED</p>
            <p className="text-title font-black text-danger">{notesMissed}</p>
          </div>
        </div>

        {/* Previous Best */}
        {previousBestScore > 0 && (
          <div className="card border-[var(--border-secondary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label text-secondary mb-0.5">PREVIOUS BEST</p>
                <p className="text-title font-black text-primary">{previousBestScore.toLocaleString()}</p>
              </div>
              {score > previousBestScore ? (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <p className="text-success font-bold">+{(score - previousBestScore).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-tertiary text-caption">Need {(previousBestScore - score).toLocaleString()} more</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-4 border-t border-[var(--border-subtle)] space-y-2">
        {passed && onNextLevel && (
          <PrimaryButton variant="violet" size="md" fullWidth icon={<ChevronRight className="w-4 h-4" />} onClick={onNextLevel}>
            Next Level
          </PrimaryButton>
        )}
        <PrimaryButton variant="cyan" size="md" fullWidth icon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
          Try Again
        </PrimaryButton>
        <SecondaryButton variant="default" size="md" fullWidth icon={<Home className="w-4 h-4" />} onClick={onHome}>
          Back to Home
        </SecondaryButton>
      </div>
    </div>
  );
}
