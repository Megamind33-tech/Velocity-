import React from 'react';

interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'cyan' | 'violet';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  default: {
    bg: 'rgba(40, 80, 160, 0.25)',
    border: '1.5px solid rgba(100, 180, 255, 0.25)',
    color: '#B8CCE8',
  },
  danger: {
    bg: 'rgba(255, 107, 107, 0.12)',
    border: '1.5px solid rgba(255, 107, 107, 0.30)',
    color: '#FF6B6B',
  },
  cyan: {
    bg: 'rgba(67, 231, 255, 0.12)',
    border: '1.5px solid rgba(67, 231, 255, 0.30)',
    color: '#43E7FF',
  },
  violet: {
    bg: 'rgba(125, 92, 255, 0.12)',
    border: '1.5px solid rgba(125, 92, 255, 0.30)',
    color: '#7D5CFF',
  },
};

const SIZE_STYLES: Record<string, string> = {
  sm: 'px-4 py-2.5 text-xs gap-1.5',
  md: 'px-6 py-3.5 text-sm gap-2',
  lg: 'px-7 py-4 text-base gap-2.5',
};

export function SecondaryButton({
  children,
  onClick,
  disabled,
  variant = 'default',
  size = 'md',
  fullWidth,
  icon,
  className = '',
}: SecondaryButtonProps) {
  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center uppercase tracking-widest
        font-bold rounded-[50px] select-none backdrop-blur-sm
        transition-all duration-150 active:scale-[0.97]
        ${SIZE_STYLES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        background: style.bg,
        border: style.border,
        color: style.color,
      }}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
