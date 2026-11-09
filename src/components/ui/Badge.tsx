import React from 'react';

export type BadgeVariant =
  | 'hadir'
  | 'sakit'
  | 'izin'
  | 'alpha'
  | 'terlambat'
  | 'dispensasi'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary'
  | 'neutral';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
  hadir: { bg: 'bg-[#E3F6EC]', text: 'text-[#1F7A4D]' },
  sakit: { bg: 'bg-[#FFF3D1]', text: 'text-[#8A6100]' },
  izin: { bg: 'bg-[#E4EEFC]', text: 'text-[#2F5FB3]' },
  alpha: { bg: 'bg-[#FDE7E9]', text: 'text-[#B4303C]' },
  terlambat: { bg: 'bg-[#FFEBD6]', text: 'text-[#B35A12]' },
  dispensasi: { bg: 'bg-[#EEE4FA]', text: 'text-[#6D3FA6]' },
  success: { bg: 'bg-[#E3F6EC]', text: 'text-[#1F7A4D]' },
  warning: { bg: 'bg-[#FFF3D1]', text: 'text-[#8A6100]' },
  danger: { bg: 'bg-[#FDE7E9]', text: 'text-[#B4303C]' },
  info: { bg: 'bg-[#E4EEFC]', text: 'text-[#2F5FB3]' },
  primary: { bg: 'bg-[#EEE4FA]', text: 'text-[#6D3FA6]' },
  neutral: { bg: 'bg-[#FAF8FD]', text: 'text-[#6B6480]', border: 'border border-[#E6DFF1]' },
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const style = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-xs font-medium whitespace-nowrap tabular-nums ${style.bg} ${style.text} ${style.border || ''} ${className}`}
    >
      {children}
    </span>
  );
};
