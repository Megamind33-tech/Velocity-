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

const VARIANT_STYLES: Record<string, string> = {
  default: 'bg-[#181F31] border border-[rgba(255,255,255,0.10)] text-[#A7B0C6] hover:text-[#F5F7FC] hover:border-[rgba(255,255,255,0.20)] hover:bg-[#1E2740]',
  danger:  'bg-transparent border border-[rgba(255,107,107,0.30)] text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.08)] hover:border-[rgba(255,107,107,0.50)]',
  cyan:    'bg-transparent border border-[rgba(67,231,255,0.30)] text-[#43E7FF] hover:bg-[rgba(67,231,255,0.08)] hover:border-[rgba(67,231,255,0.50)]',
  violet:  'bg-transparent border border-[rgba(125,92,255,0.30)] text-[#7D5CFF] hover:bg-[rgba(125,92,255,0.08)] hover:border-[rgba(125,92,255,0.50)]',
};

const SIZE_STYLES: Record<string, string> = {
  sm: 'px-4 py-2.5 text-xs font-bold rounded-xl gap-1.5',
  md: 'px-6 py-3.5 text-sm font-bold rounded-xl gap-2',
  lg: 'px-7 py-4 text-base font-bold rounded-2xl gap-2.5',
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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center uppercase tracking-widest
        transition-all duration-150 active:scale-[0.97] select-none
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
