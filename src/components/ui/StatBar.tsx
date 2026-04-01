import React from 'react';

interface StatBarProps {
  label: string;
  value: number | string;
  max?: number;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  showBar?: boolean;
  compact?: boolean;
}

const VARIANT_COLORS = {
  primary: { bg: 'rgba(67,231,255,0.12)', fill: '#43E7FF', text: '#43E7FF' },
  secondary: { bg: 'rgba(125,92,255,0.12)', fill: '#7D5CFF', text: '#7D5CFF' },
  success: { bg: 'rgba(185,255,102,0.12)', fill: '#B9FF66', text: '#B9FF66' },
  warning: { bg: 'rgba(255,201,74,0.12)', fill: '#FFC94A', text: '#FFC94A' },
  danger: { bg: 'rgba(255,107,107,0.12)', fill: '#FF6B6B', text: '#FF6B6B' },
};

export function StatBar({
  label,
  value,
  max,
  icon,
  variant = 'primary',
  showBar = true,
  compact = false,
}: StatBarProps) {
  const colors = VARIANT_COLORS[variant];
  const percentage = max ? ((typeof value === 'number' ? value : 0) / max) * 100 : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        {icon && <div style={{ color: colors.text }}>{icon}</div>}
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-bold uppercase tracking-wider text-text-tertiary">{label}</div>
          <div className="text-sm font-black score-display" style={{ color: colors.text }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {icon && <div style={{ color: colors.text }}>{icon}</div>}
          <span className="text-label text-text-primary">{label}</span>
        </div>
        <span className="text-sm font-black score-display" style={{ color: colors.text }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          {max && <span className="text-text-tertiary">/{max.toLocaleString()}</span>}
        </span>
      </div>

      {/* Bar */}
      {showBar && (
        <div className="h-2 rounded-full overflow-hidden" style={{ background: colors.bg }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              background: colors.fill,
              boxShadow: `0 0 8px ${colors.fill}80`,
            }}
          />
        </div>
      )}
    </div>
  );
}
