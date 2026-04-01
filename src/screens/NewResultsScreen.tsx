import React, { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, Home, RefreshCw } from 'lucide-react';
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
  onHome: () => void;
  onRetry: () => void;
}

export function NewResultsScreen({
  song,
  level,
  mode,
  score,
  accuracy,
  maxCombo,
  notesHit,
  notesMissed,
  previousBestScore,
  onHome,
  onRetry,
}: NewResultsScreenProps) {
  const [stars, setStars] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    // Calculate stars
    if (accuracy >= 90) {
      setStars(3);
    } else if (accuracy >= 75) {
      setStars(2);
    } else if (accuracy >= 60) {
      setStars(1);
    } else {
      setStars(0);
    }

    // Check if new record
    if (score > previousBestScore) {
      setIsNewRecord(true);
    }
  }, [accuracy, score, previousBestScore]);

  const levelInfo = getLevelInfo(level);

  return (
    <div className="game-screen stage-bg flex flex-col">
      {/* Result Header */}
      <div className="px-4 py-8 text-center border-b border-[var(--border-subtle)]">
        {score >= 750 ? (
          <Trophy className="w-12 h-12 text-[#FFC94A] mx-auto mb-4 animate-bounce" />
        ) : (
          <Star className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-4" />
        )}

        <h1
          className="text-display-lg font-black mb-2"
          style={{
            color:
              score >= 750 ? '#FFC94A' : accuracy >= 90 ? '#B9FF66' : accuracy >= 75 ? '#FFC94A' : '#FF6B6B',
          }}
        >
          {score >= 750 ? 'PERFECT!' : accuracy >= 90 ? 'EXCELLENT!' : accuracy >= 75 ? 'GOOD!' : 'TRY AGAIN'}
        </h1>

        <p className="text-secondary">{song.title} - {levelInfo?.name}</p>
      </div>

      {/* Score Display */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Main Score */}
        <div className="card bg-gradient-to-br from-[#43E7FF]/10 to-[#7D5CFF]/10 border-[var(--border-primary)]">
          <div className="text-center">
            <p className="text-label text-secondary mb-2">FINAL SCORE</p>
            <p className="text-display-xl font-black text-primary">{score}</p>
            {isNewRecord && (
              <p className="text-caption text-success font-bold mt-2">NEW RECORD! 🎉</p>
            )}
          </div>
        </div>

        {/* Star Rating */}
        <div className="card text-center">
          <p className="text-label text-secondary mb-3">RATING</p>
          <div className="flex justify-center gap-3 mb-2">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 ${
                  star <= stars ? 'fill-[#FFC94A] text-[#FFC94A]' : 'text-[var(--border-default)]'
                }`}
              />
            ))}
          </div>
          <p className="text-caption text-secondary">
            {stars === 3 ? 'Perfect Performance!' : stars === 2 ? 'Great Job!' : stars === 1 ? 'Good Effort!' : 'Keep Practicing!'}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card bg-[rgba(67,231,255,0.08)]">
            <p className="text-caption text-tertiary mb-1">ACCURACY</p>
            <p className="text-headline font-black text-primary">{accuracy.toFixed(1)}%</p>
          </div>

          <div className="card bg-[rgba(185,255,102,0.08)]">
            <p className="text-caption text-tertiary mb-1">MAX COMBO</p>
            <p className="text-headline font-black text-success">{maxCombo}</p>
          </div>

          <div className="card bg-[rgba(125,92,255,0.08)]">
            <p className="text-caption text-tertiary mb-1">NOTES HIT</p>
            <p className="text-headline font-black text-secondary">
              {notesHit}/{notesHit + notesMissed}
            </p>
          </div>

          <div className="card bg-[rgba(255,107,107,0.08)]">
            <p className="text-caption text-tertiary mb-1">MISSED</p>
            <p className="text-headline font-black text-danger">{notesMissed}</p>
          </div>
        </div>

        {/* Comparison with Previous Best */}
        {previousBestScore > 0 && (
          <div className="card border-[var(--border-secondary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label text-secondary mb-1">PREVIOUS BEST</p>
                <p className="text-title font-black text-primary">{previousBestScore}</p>
              </div>
              {score > previousBestScore ? (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <p className="text-success font-bold">+{score - previousBestScore}</p>
                </div>
              ) : (
                <p className="text-tertiary text-caption">Need {previousBestScore - score} more points</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-4 border-t border-[var(--border-subtle)] space-y-2">
        <PrimaryButton
          variant="cyan"
          size="md"
          fullWidth
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={onRetry}
        >
          Try Again
        </PrimaryButton>

        <SecondaryButton
          variant="default"
          size="md"
          fullWidth
          icon={<Home className="w-4 h-4" />}
          onClick={onHome}
        >
          Back to Home
        </SecondaryButton>
      </div>
    </div>
  );
}
