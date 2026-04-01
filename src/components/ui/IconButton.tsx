import React from 'react';

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  variant?: 'ghost' | 'surface' | 'cyan' | 'danger' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  active?: boolean;
}

export function IconButton({
  children,
  onClick,
  label,
  variant = 'white',
  size = 'md',
  className = '',
  active,
}: IconButtonProps) {
  const sizeMap: Record<string, string> = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-12 h-12 rounded-[14px]',
    lg: 'w-14 h-14 rounded-2xl',
  };

  const variantMap: Record<string, React.CSSProperties> = {
    white: {
      background: 'rgba(255,255,255,0.88)',
      color: '#2A3080',
      boxShadow: '0 3px 0 rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.18)',
      border: 'none',
    },
    ghost: {
      background: 'rgba(255,255,255,0.08)',
      color: '#B8CCE8',
      border: '1px solid rgba(255,255,255,0.15)',
    },
    surface: {
      background: 'rgba(40, 80, 160, 0.30)',
      color: '#B8CCE8',
      border: '1.5px solid rgba(100, 180, 255, 0.22)',
    },
    cyan: {
      background: 'rgba(67,231,255,0.15)',
      color: '#43E7FF',
      border: '1.5px solid rgba(67,231,255,0.30)',
    },
    danger: {
      background: 'rgba(255,107,107,0.15)',
      color: '#FF6B6B',
      border: '1.5px solid rgba(255,107,107,0.30)',
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`
        inline-flex items-center justify-center shrink-0 cursor-pointer
        transition-all duration-150 active:translate-y-[2px] active:scale-95 select-none
        ${sizeMap[size]}
        ${active ? 'ring-2 ring-[rgba(100,180,255,0.5)]' : ''}
        ${className}
      `}
      style={variantMap[variant] || variantMap.white}
    >
      {children}
    </button>
  );
}
