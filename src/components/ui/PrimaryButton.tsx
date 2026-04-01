import React from 'react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'gold' | 'cyan' | 'violet' | 'success' | 'fail' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
}

const VARIANT_STYLES: Record<string, { bg: string; color: string; shadow: string; activeShadow: string }> = {
  gold: {
    bg: 'linear-gradient(180deg, #FFE566 0%, #FFBF00 40%, #D4950A 100%)',
    color: '#3D2000',
    shadow: '0 4px 0 #8B6508, 0 6px 20px rgba(255,191,0,0.4), inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -2px 4px rgba(0,0,0,0.15)',
    activeShadow: '0 1px 0 #8B6508, 0 2px 10px rgba(255,191,0,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
  },
  cyan: {
    bg: 'linear-gradient(180deg, #70F5FF 0%, #43E7FF 40%, #1BB8D4 100%)',
    color: '#07090E',
    shadow: '0 4px 0 #0D7A8F, 0 6px 20px rgba(67,231,255,0.4), inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -2px 4px rgba(0,0,0,0.15)',
    activeShadow: '0 1px 0 #0D7A8F, 0 2px 10px rgba(67,231,255,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
  },
  violet: {
    bg: 'linear-gradient(180deg, #9B7FFF 0%, #7D5CFF 40%, #5A3FD9 100%)',
    color: '#ffffff',
    shadow: '0 4px 0 #3D2A8A, 0 6px 20px rgba(125,92,255,0.4), inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.15)',
    activeShadow: '0 1px 0 #3D2A8A, 0 2px 10px rgba(125,92,255,0.3), inset 0 2px 0 rgba(255,255,255,0.2)',
  },
  success: {
    bg: 'linear-gradient(180deg, #D4FF8C 0%, #B9FF66 40%, #8FCC40 100%)',
    color: '#1A3000',
    shadow: '0 4px 0 #5A8020, 0 6px 20px rgba(185,255,102,0.4), inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -2px 4px rgba(0,0,0,0.15)',
    activeShadow: '0 1px 0 #5A8020, 0 2px 10px rgba(185,255,102,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
  },
  fail: {
    bg: 'linear-gradient(180deg, #FF8080 0%, #FF6B6B 40%, #E63B3B 100%)',
    color: '#ffffff',
    shadow: '0 4px 0 #A02020, 0 6px 20px rgba(255,107,107,0.4), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.15)',
    activeShadow: '0 1px 0 #A02020, 0 2px 10px rgba(255,107,107,0.3), inset 0 2px 0 rgba(255,255,255,0.2)',
  },
  amber: {
    bg: 'linear-gradient(180deg, #FFD468 0%, #FFC94A 40%, #D4A020 100%)',
    color: '#3D2000',
    shadow: '0 4px 0 #8B6D08, 0 6px 20px rgba(255,201,74,0.4), inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -2px 4px rgba(0,0,0,0.15)',
    activeShadow: '0 1px 0 #8B6D08, 0 2px 10px rgba(255,201,74,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
  },
};

const SIZE_STYLES: Record<string, string> = {
  sm: 'px-5 py-3 text-sm gap-2',
  md: 'px-7 py-4 text-base gap-2.5',
  lg: 'px-8 py-5 text-lg gap-3',
};

export function PrimaryButton({
  children,
  onClick,
  disabled,
  variant = 'gold',
  size = 'md',
  fullWidth,
  icon,
  className = '',
  type = 'button',
}: PrimaryButtonProps) {
  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.gold;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center uppercase tracking-widest
        font-black rounded-[50px] select-none overflow-hidden
        transition-transform duration-150 active:translate-y-[3px]
        ${SIZE_STYLES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        fontFamily: 'var(--font-game, Orbitron, sans-serif)',
        background: style.bg,
        color: style.color,
        boxShadow: style.shadow,
        textShadow: variant === 'gold' || variant === 'amber' || variant === 'success' || variant === 'cyan'
          ? '0 1px 0 rgba(255,255,200,0.4)' : '0 1px 2px rgba(0,0,0,0.3)',
        border: 'none',
      }}
    >
      {icon && <span className="relative z-10 shrink-0">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
