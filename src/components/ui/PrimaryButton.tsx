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
    bg: 'linear-gradient(180deg, #FFE88A 0%, #FFD030 25%, #FFBF00 50%, #D4950A 85%, #AA7005 100%)',
    color: '#3D2000',
    shadow: '0 5px 0 #8B6508, 0 7px 0 #6B4D06, 0 8px 24px rgba(255,191,0,0.5), inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.2)',
    activeShadow: '0 1px 0 #8B6508, 0 2px 10px rgba(255,191,0,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
  },
  cyan: {
    bg: 'linear-gradient(180deg, #80F8FF 0%, #50EEFF 25%, #43E7FF 50%, #1BB8D4 85%, #0D96B0 100%)',
    color: '#07090E',
    shadow: '0 5px 0 #0D7A8F, 0 7px 0 #0A5E70, 0 8px 24px rgba(67,231,255,0.5), inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.2)',
    activeShadow: '0 1px 0 #0D7A8F, 0 2px 10px rgba(67,231,255,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
  },
  violet: {
    bg: 'linear-gradient(180deg, #B89FFF 0%, #9B7FFF 25%, #7D5CFF 50%, #5A3FD9 85%, #4530B0 100%)',
    color: '#ffffff',
    shadow: '0 5px 0 #3D2A8A, 0 7px 0 #2D1F68, 0 8px 24px rgba(125,92,255,0.5), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.2)',
    activeShadow: '0 1px 0 #3D2A8A, 0 2px 10px rgba(125,92,255,0.3), inset 0 2px 0 rgba(255,255,255,0.2)',
  },
  success: {
    bg: 'linear-gradient(180deg, #E0FFA0 0%, #C8FF78 25%, #B9FF66 50%, #8FCC40 85%, #70A030 100%)',
    color: '#1A3000',
    shadow: '0 5px 0 #5A8020, 0 7px 0 #456018, 0 8px 24px rgba(185,255,102,0.5), inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.2)',
    activeShadow: '0 1px 0 #5A8020, 0 2px 10px rgba(185,255,102,0.3), inset 0 2px 0 rgba(255,255,255,0.3)',
  },
  fail: {
    bg: 'linear-gradient(180deg, #FF9595 0%, #FF8080 25%, #FF6B6B 50%, #E63B3B 85%, #C02020 100%)',
    color: '#ffffff',
    shadow: '0 5px 0 #A02020, 0 7px 0 #801818, 0 8px 24px rgba(255,107,107,0.5), inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 6px rgba(0,0,0,0.2)',
    activeShadow: '0 1px 0 #A02020, 0 2px 10px rgba(255,107,107,0.3), inset 0 2px 0 rgba(255,255,255,0.2)',
  },
  amber: {
    bg: 'linear-gradient(180deg, #FFE088 0%, #FFD468 25%, #FFC94A 50%, #D4A020 85%, #AA8018 100%)',
    color: '#3D2000',
    shadow: '0 5px 0 #8B6D08, 0 7px 0 #6B5506, 0 8px 24px rgba(255,201,74,0.5), inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.2)',
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
