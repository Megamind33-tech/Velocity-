import React from 'react';

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  variant?: 'ghost' | 'surface' | 'cyan' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  active?: boolean;
}

const VARIANT_STYLES: Record<string, string> = {
  ghost:   'text-[#A7B0C6] hover:text-[#F5F7FC] hover:bg-[rgba(255,255,255,0.06)]',
  surface: 'bg-[#181F31] border border-[rgba(255,255,255,0.08)] text-[#A7B0C6] hover:text-[#F5F7FC] hover:border-[rgba(255,255,255,0.16)]',
  cyan:    'bg-[rgba(67,231,255,0.10)] border border-[rgba(67,231,255,0.25)] text-[#43E7FF] hover:bg-[rgba(67,231,255,0.18)]',
  danger:  'bg-[rgba(255,107,107,0.10)] border border-[rgba(255,107,107,0.25)] text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.18)]',
};

const SIZE_STYLES: Record<string, string> = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-11 h-11 rounded-xl',
  lg: 'w-14 h-14 rounded-2xl',
};

export function IconButton({
  children,
  onClick,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  active,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`
        inline-flex items-center justify-center shrink-0
        transition-all duration-150 active:scale-90 select-none
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${active ? 'ring-1 ring-[#43E7FF]/40' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
