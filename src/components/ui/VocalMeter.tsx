import React from 'react';

interface VocalMeterProps {
  accuracy: number; // 0-100
  volume: number; // 0-100
  variant?: 'cyan' | 'violet' | 'success';
  compact?: boolean;
}

export function VocalMeter({ accuracy, volume, variant = 'cyan', compact = false }: VocalMeterProps) {
  const colorMap = {
    cyan: { bg: 'rgba(67,231,255,0.12)', fill: '#43E7FF', glow: 'rgba(67,231,255,0.5)' },
    violet: { bg: 'rgba(125,92,255,0.12)', fill: '#7D5CFF', glow: 'rgba(125,92,255,0.5)' },
    success: { bg: 'rgba(185,255,102,0.12)', fill: '#B9FF66', glow: 'rgba(185,255,102,0.5)' },
  };

  const colors = colorMap[variant];
  const isAccurate = accuracy >= 75;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: colors.bg }}>
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${accuracy}%`,
                background: colors.fill,
                boxShadow: `0 0 12px ${colors.glow}`,
              }}
            />
          </div>
        </div>
        <span className="text-xs font-black score-display" style={{ color: colors.fill, minWidth: '3ch' }}>
          {Math.round(accuracy)}%
        </span>
      </div>
    );
  }

  return (
    <div className="card-accent-primary rounded-xl p-4 space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-label text-text-primary">Vocal Accuracy</h3>
        <span className={`text-sm font-black score-display ${isAccurate ? 'glow-success' : 'text-warning'}`}>
          {Math.round(accuracy)}%
        </span>
      </div>

      {/* Accuracy meter */}
      <div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: colors.bg }}>
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${accuracy}%`,
              background: isAccurate
                ? 'linear-gradient(90deg, #43E7FF, #B9FF66)'
                : 'linear-gradient(90deg, #FFC94A, #FF6B6B)',
              boxShadow: isAccurate ? `0 0 16px ${colors.glow}` : '0 0 16px rgba(255,107,107,0.5)',
            }}
          />
        </div>
      </div>

      {/* Volume indicator */}
      <div className="flex items-center gap-2 pt-2">
        <span className="text-[9px] font-bold uppercase tracking-wider text-text-tertiary">Volume</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: colors.bg }}>
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${volume}%`,
              background: colors.fill,
            }}
          />
        </div>
        <span className="text-xs font-black" style={{ color: colors.fill, minWidth: '2ch' }}>
          {Math.round(volume)}
        </span>
      </div>

      {/* Feedback */}
      <div className="text-center text-[10px] font-bold uppercase tracking-widest">
        {isAccurate ? (
          <span className="text-success">✓ Perfect Pitch</span>
        ) : accuracy >= 50 ? (
          <span className="text-warning">≈ Good</span>
        ) : (
          <span className="text-danger">✗ Off Pitch</span>
        )}
      </div>
    </div>
  );
}
