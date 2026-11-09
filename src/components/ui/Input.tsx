import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#2D2640]">
          {label} {required && <span className="text-[#B4303C]">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`h-[40px] px-3 text-sm bg-white border rounded-[6px] text-[#2D2640] placeholder:text-[#A69FB8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8650C4] focus:ring-offset-2 disabled:bg-[#FAF8FD] disabled:cursor-not-allowed ${
          error ? 'border-[#B4303C] focus:ring-[#B4303C]' : 'border-[#E6DFF1]'
        } ${className}`}
        required={required}
        {...props}
      />
      {error ? (
        <span className="text-xs text-[#B4303C]">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[#6B6480]">{helperText}</span>
      ) : null}
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  required,
  id,
  options = [],
  children,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-[#2D2640]">
          {label} {required && <span className="text-[#B4303C]">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`h-[40px] px-3 text-sm bg-white border rounded-[6px] text-[#2D2640] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8650C4] focus:ring-offset-2 disabled:bg-[#FAF8FD] disabled:cursor-not-allowed ${
          error ? 'border-[#B4303C] focus:ring-[#B4303C]' : 'border-[#E6DFF1]'
        } ${className}`}
        required={required}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      {error ? (
        <span className="text-xs text-[#B4303C]">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[#6B6480]">{helperText}</span>
      ) : null}
    </div>
  );
};
