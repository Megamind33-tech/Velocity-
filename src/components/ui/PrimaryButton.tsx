import React from 'react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'cyan' | 'violet' | 'success' | 'fail' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
}

const VARIANT_STYLES: Record<string, string> = {
  cyan:    'bg-[#43E7FF] text-[#07090E] shadow-[0_0_24px_rgba(67,231,255,0.4)] hover:shadow-[0_0_36px_rgba(67,231,255,0.6)] hover:bg-[#6AEDFF] active:bg-[#2EDCF7]',
  violet:  'bg-[#7D5CFF] text-white shadow-[0_0_24px_rgba(125,92,255,0.4)] hover:shadow-[0_0_36px_rgba(125,92,255,0.6)] hover:bg-[#9175FF] active:bg-[#6B4BFF]',
  success: 'bg-[#B9FF66] text-[#07090E] shadow-[0_0_24px_rgba(185,255,102,0.4)] hover:shadow-[0_0_36px_rgba(185,255,102,0.6)] hover:bg-[#C9FF80] active:bg-[#A8F050]',
  fail:    'bg-[#FF6B6B] text-white shadow-[0_0_24px_rgba(255,107,107,0.4)] hover:shadow-[0_0_36px_rgba(255,107,107,0.6)] hover:bg-[#FF8080] active:bg-[#F55555]',
  amber:   'bg-[#FFC94A] text-[#07090E] shadow-[0_0_24px_rgba(255,201,74,0.4)] hover:shadow-[0_0_36px_rgba(255,201,74,0.6)] hover:bg-[#FFD468] active:bg-[#F5B830]',
};

const SIZE_STYLES: Record<string, string> = {
  sm: 'px-5 py-3 text-sm font-bold rounded-xl gap-2',
  md: 'px-7 py-4 text-base font-black rounded-2xl gap-2.5',
  lg: 'px-8 py-5 text-lg font-black rounded-2xl gap-3',
};

export function PrimaryButton({
  children,
  onClick,
  disabled,
  variant = 'cyan',
  size = 'md',
  fullWidth,
  icon,
  className = '',
  type = 'button',
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center uppercase tracking-widest
        font-display transition-all duration-150 active:scale-[0.96] select-none
        overflow-hidden
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
    >
      {/* Shimmer effect */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
        aria-hidden
      />
      {icon && <span className="relative z-10 shrink-0">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
