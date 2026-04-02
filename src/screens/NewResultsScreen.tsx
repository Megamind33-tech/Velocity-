import React, { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, Home, RefreshCw, Zap } from 'lucide-react';
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

  const headlineColor =
    score >= 750 ? '#FFC94A' : accuracy >= 90 ? '#B9FF66' : accuracy >= 75 ? '#FFC94A' : '#FF6B6B';

  return (
    <div className="game-screen mg-stage flex flex-col">
      <div className="mg-kit-layer mg-kit-layer--tournament" aria-hidden />
      <div className="mg-vignette" aria-hidden />
      <div className="mg-scanlines" aria-hidden />

      {/* Stars hero section */}
      <header className="shrink-0 relative z-[3] flex flex-col items-center text-center pt-8 pb-4 px-4">
        {/* Big stars */}
        <div className="flex items-end justify-center gap-3 mb-4">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`${s === 2 ? 'w-16 h-16 -mt-3' : 'w-12 h-12'} transition-all duration-500 ${
                s <= stars
                  ? 'fill-[#FFC94A] text-[#FFC94A]'
                  : 'fill-[rgba(60,80,120,0.4)] text-[rgba(60,80,120,0.4)]'
              }`}
              style={s <= stars ? { filter: 'drop-shadow(0 0 14px rgba(255,201,74,0.7))' } : undefined}
            />
          ))}
        </div>

        <h1
          className="text-2xl sm:text-3xl font-black tracking-tight mb-1"
          style={{
            fontFamily: 'var(--font-game, Orbitron, sans-serif)',
            color: '#ffffff',
            textShadow: `0 0 30px ${headlineColor}55`,
          }}
        >
          {passed ? 'LEVEL COMPLETE' : 'TRY AGAIN'}
        </h1>
        <p className="text-xs text-[#8BA0C8] font-medium">
          {song.title} · {levelInfo?.name}
        </p>
      </header>

      <div className="mg-scroll space-y-4">
        {/* Score panel */}
        <div className="mg-panel !text-center !animate-none">
          <div className="mg-panel-header justify-center">Final score</div>
          <div className="flex items-center justify-center gap-3">
            <Zap className="w-5 h-5 text-[#FFC94A]" />
            <p className="score-display text-4xl font-black text-white tabular-nums">{score.toLocaleString()}</p>
          </div>
          {isNewRecord && (
            <p className="text-[11px] font-black uppercase tracking-widest text-[#B9FF66] mt-2">New record!</p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="mg-panel !p-3 !animate-none">
            <p className="text-[9px] font-black uppercase tracking-wider text-[#6B85B0] mb-1">Accuracy</p>
            <p className="text-xl font-black text-[#43E7FF] tabular-nums">{accuracy.toFixed(1)}%</p>
          </div>
          <div className="mg-panel !p-3 !animate-none">
            <p className="text-[9px] font-black uppercase tracking-wider text-[#6B85B0] mb-1">Max combo</p>
            <p className="text-xl font-black text-[#B9FF66] tabular-nums">{maxCombo}</p>
          </div>
          <div className="mg-panel !p-3 !animate-none">
            <p className="text-[9px] font-black uppercase tracking-wider text-[#6B85B0] mb-1">Notes</p>
            <p className="text-xl font-black text-[#7D5CFF] tabular-nums">
              {notesHit}/{notesHit + notesMissed}
            </p>
          </div>
          <div className="mg-panel !p-3 !animate-none">
            <p className="text-[9px] font-black uppercase tracking-wider text-[#6B85B0] mb-1">Missed</p>
            <p className="text-xl font-black text-[#FF6B6B] tabular-nums">{notesMissed}</p>
          </div>
        </div>

        {/* Previous best */}
        {previousBestScore > 0 && (
          <div className="mg-panel !animate-none">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#6B85B0] mb-1">Previous best</p>
                <p className="text-lg font-black text-white tabular-nums">{previousBestScore.toLocaleString()}</p>
              </div>
              {score > previousBestScore ? (
                <div className="flex items-center gap-2 text-[#B9FF66]">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-black tabular-nums">+{(score - previousBestScore).toLocaleString()}</span>
                </div>
              ) : (
                <p className="text-[11px] text-[#6B85B0] text-right">
                  {(previousBestScore - score).toLocaleString()} pts to beat best
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with golden retry button */}
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
