import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  label?: string;
  variant?: 'primary' | 'secondary' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTrend?: boolean;
  trend?: number; // percentage change
}

export function ScoreDisplay({
  score,
  label = 'Score',
  variant = 'primary',
  size = 'md',
  showTrend = false,
  trend = 0,
}: ScoreDisplayProps) {
  const sizeMap = {
    sm: { number: 'text-xl', label: 'text-[9px]' },
    md: { number: 'text-3xl', label: 'text-xs' },
    lg: { number: 'text-5xl', label: 'text-sm' },
    xl: { number: 'text-7xl', label: 'text-base' },
  };

  const variantMap = {
    primary: { color: '#43E7FF', glow: 'rgba(67,231,255,0.5)' },
    secondary: { color: '#7D5CFF', glow: 'rgba(125,92,255,0.5)' },
    success: { color: '#B9FF66', glow: 'rgba(185,255,102,0.5)' },
  };

  const sizes = sizeMap[size];
  const colors = variantMap[variant];

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Label */}
      {label && (
        <div className={`text-label text-text-tertiary uppercase tracking-widest ${sizes.label}`}>
          {label}
        </div>
      )}

      {/* Score with glow */}
      <div className="relative">
        <div
          className={`font-black score-display tabular-nums ${sizes.number}`}
          style={{
            color: colors.color,
            textShadow: `0 0 20px ${colors.glow}`,
          }}
        >
          {score.toLocaleString()}
        </div>
      </div>

      {/* Trend indicator */}
      {showTrend && trend !== 0 && (
        <div
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
          style={{
            color: trend > 0 ? '#B9FF66' : trend < 0 ? '#FF6B6B' : '#A7B0C6',
          }}
        >
          <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );
}
