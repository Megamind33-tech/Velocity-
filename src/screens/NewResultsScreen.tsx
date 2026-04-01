import React, { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, Home, RefreshCw } from 'lucide-react';
import { Song } from '../lib/songs-extended';
import { getLevelInfo } from '../lib/progression';
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

  const headlineColor =
    score >= 750 ? '#FFC94A' : accuracy >= 90 ? '#B9FF66' : accuracy >= 75 ? '#FFC94A' : '#FF6B6B';

  return (
    <div className="game-screen mg-stage flex flex-col">
      <div className="mg-vignette" aria-hidden />
      <div className="mg-scanlines" aria-hidden />

      <header className="mg-topbar shrink-0 flex-col items-center text-center !py-6">
        {score >= 750 ? (
          <Trophy className="w-14 h-14 text-[#FFC94A] mb-3" style={{ filter: 'drop-shadow(0 0 12px rgba(255,201,74,0.6))' }} />
        ) : (
          <Star className="w-14 h-14 text-[#43E7FF] mb-3" style={{ filter: 'drop-shadow(0 0 12px rgba(67,231,255,0.5))' }} />
        )}
        <h1
          className="text-2xl sm:text-3xl font-black tracking-tight mb-1"
          style={{
            fontFamily: 'var(--font-game, Orbitron, sans-serif)',
            color: headlineColor,
            textShadow: `0 0 24px ${headlineColor}55`,
          }}
        >
          {score >= 750 ? 'PERFECT' : accuracy >= 90 ? 'EXCELLENT' : accuracy >= 75 ? 'GOOD RUN' : 'TRY AGAIN'}
        </h1>
        <p className="text-xs text-[#A7B0C6] font-medium">
          {song.title} · {levelInfo?.name}
        </p>
      </header>

      <div className="mg-scroll space-y-4">
        <div className="mg-panel !text-center !animate-none">
          <div className="mg-panel-header justify-center">Final score</div>
          <p className="score-display text-4xl font-black text-[#F5F7FC] tabular-nums">{score.toLocaleString()}</p>
          {isNewRecord && (
            <p className="text-[11px] font-black uppercase tracking-widest text-[#B9FF66] mt-2">New record</p>
          )}
        </div>

        <div className="mg-panel !text-center !animate-none">
          <div className="mg-panel-header justify-center">Rating</div>
          <div className="flex justify-center gap-4 mb-2 py-1">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-9 h-9 ${
                  star <= stars ? 'fill-[#FFC94A] text-[#FFC94A]' : 'text-[var(--border-default)]'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-[#A7B0C6]">
            {stars === 3 ? 'Flawless vocal line.' : stars === 2 ? 'Strong performance.' : stars === 1 ? 'Solid effort.' : 'Practice the chart.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="mg-panel !p-3 !animate-none">
            <p className="text-[9px] font-black uppercase tracking-wider text-[#7A8399] mb-1">Accuracy</p>
            <p className="text-xl font-black text-[#43E7FF] tabular-nums">{accuracy.toFixed(1)}%</p>
          </div>
          <div className="mg-panel !p-3 !animate-none">
            <p className="text-[9px] font-black uppercase tracking-wider text-[#7A8399] mb-1">Max combo</p>
            <p className="text-xl font-black text-[#B9FF66] tabular-nums">{maxCombo}</p>
          </div>
          <div className="mg-panel !p-3 !animate-none">
            <p className="text-[9px] font-black uppercase tracking-wider text-[#7A8399] mb-1">Notes</p>
            <p className="text-xl font-black text-[#7D5CFF] tabular-nums">
              {notesHit}/{notesHit + notesMissed}
            </p>
          </div>
          <div className="mg-panel !p-3 !animate-none">
            <p className="text-[9px] font-black uppercase tracking-wider text-[#7A8399] mb-1">Missed</p>
            <p className="text-xl font-black text-[#FF6B6B] tabular-nums">{notesMissed}</p>
          </div>
        </div>

        {previousBestScore > 0 && (
          <div className="mg-panel !animate-none">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#7A8399] mb-1">Previous best</p>
                <p className="text-lg font-black text-[#F5F7FC] tabular-nums">{previousBestScore.toLocaleString()}</p>
              </div>
              {score > previousBestScore ? (
                <div className="flex items-center gap-2 text-[#B9FF66]">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-black tabular-nums">+{(score - previousBestScore).toLocaleString()}</span>
                </div>
              ) : (
                <p className="text-[11px] text-[#7A8399] text-right">
                  {(previousBestScore - score).toLocaleString()} pts to beat best
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="mg-footer-bar shrink-0 space-y-2">
        <button type="button" className="mg-cta" onClick={onRetry}>
          <RefreshCw className="w-5 h-5" />
          Retry
        </button>
        <SecondaryButton variant="default" size="md" fullWidth icon={<Home className="w-4 h-4" />} onClick={onHome}>
          Home
        </SecondaryButton>
      </footer>
    </div>
  );
}
