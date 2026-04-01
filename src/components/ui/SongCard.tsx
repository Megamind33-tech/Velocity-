import React from 'react';
import { Music, Star, Zap } from 'lucide-react';

interface SongCardProps {
  title: string;
  artist: string;
  tempo?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  bestScore?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const DIFFICULTY_COLORS = {
  easy: { bg: 'rgba(185,255,102,0.15)', border: 'rgba(185,255,102,0.35)', text: '#B9FF66', label: 'Easy' },
  medium: { bg: 'rgba(255,201,74,0.15)', border: 'rgba(255,201,74,0.35)', text: '#FFC94A', label: 'Medium' },
  hard: { bg: 'rgba(255,107,107,0.15)', border: 'rgba(255,107,107,0.35)', text: '#FF6B6B', label: 'Hard' },
};

export function SongCard({
  title,
  artist,
  tempo,
  difficulty,
  bestScore,
  isSelected = false,
  onClick,
}: SongCardProps) {
  const diffColor = DIFFICULTY_COLORS[difficulty];

  return (
    <button
      onClick={onClick}
      className={`card transition-all duration-300 cursor-pointer w-full text-left ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
      style={isSelected ? { ringColor: diffColor.text, ringOffsetColor: 'var(--bg-primary)' } : {}}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#7D5CFF] to-[#43E7FF] flex items-center justify-center">
          <Music className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-title font-black text-text-primary truncate">{title}</h3>
          <p className="text-caption text-text-secondary truncate">{artist}</p>
        </div>
        {tempo && (
          <div className="flex-shrink-0 text-right">
            <div className="text-xs font-black score-display text-text-primary">{tempo}</div>
            <div className="text-[9px] font-bold uppercase text-text-tertiary">BPM</div>
          </div>
        )}
      </div>

      {/* Difficulty and Stats */}
      <div className="flex items-center gap-2">
        <span
          className="badge text-[10px] font-black px-2 py-1"
          style={{ background: diffColor.bg, color: diffColor.text, borderColor: diffColor.border }}
        >
          {diffColor.label}
        </span>

        {bestScore ? (
          <div className="flex items-center gap-1 ml-auto">
            <Star className="w-3 h-3 text-[#FFC94A]" />
            <span className="text-xs font-black score-display text-text-secondary">
              {bestScore.toLocaleString()}
            </span>
          </div>
        ) : (
          <div className="ml-auto flex items-center gap-1 text-[10px] text-text-tertiary">
            <Zap className="w-3 h-3" />
            New
          </div>
        )}
      </div>
    </button>
  );
}
