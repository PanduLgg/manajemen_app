import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#8650C4] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shrink-0 cursor-pointer';

  const sizeClasses = {
    sm: 'h-[32px] px-3 text-xs gap-1.5',
    md: 'h-[36px] px-4 text-sm gap-2',
    lg: 'h-[40px] px-5 text-sm gap-2',
  };

  const variantClasses = {
    primary: 'bg-[#8650C4] text-white hover:bg-[#6D3FA6] active:bg-[#55327F]',
    secondary: 'bg-[#EEE4FA] text-[#6D3FA6] hover:bg-[#DEC9F5] active:bg-[#C8A6EE]',
    outline: 'border border-[#E6DFF1] bg-white text-[#2D2640] hover:bg-[#FAF8FD] active:bg-[#EEE4FA]',
    ghost: 'text-[#6B6480] hover:text-[#2D2640] hover:bg-[#FAF8FD] active:bg-[#EEE4FA]',
    destructive: 'bg-[#B4303C] text-white hover:bg-[#922630] active:bg-[#721C24]',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={1.5} /> : icon}
      {children}
    </button>
  );
};
