import React from 'react';

interface InputProps {
  id?: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  rows?: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'bordered';
  min?: string | number;
  max?: string | number;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  rows = 3,
  icon,
  variant = 'default',
  min,
  max
}) => {
  // Blocksy 스타일 기본 클래스
  const baseClasses = 'block w-full px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm font-medium rounded-blocksy';
  
  // Blocksy 스타일 variant 클래스 (흰색 배경 + 흰색 글씨 문제 해결)
  const variantClasses = {
    default: 'bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-500',
    filled: 'bg-neutral-50 border border-transparent text-neutral-900 placeholder-neutral-600',
    bordered: 'bg-white border-2 border-primary-200 text-neutral-900 placeholder-neutral-500'
  };
  
  // 상태별 스타일 (에러/정상/비활성화)
  const stateClasses = error 
    ? 'border-error-500 text-error-900 placeholder-error-400 focus:ring-error-500 focus:border-error-600 bg-error-50' 
    : disabled
    ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed border-neutral-200'
    : `${variantClasses[variant]} hover:border-primary-400 focus:ring-primary-500 focus:border-primary-500`;

  const inputClasses = `${baseClasses} ${stateClasses} ${icon ? 'pl-12' : ''} ${className}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-semibold text-neutral-700"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
            {icon}
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            id={id}
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={inputClasses}
          />
        ) : (
          <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={inputClasses}
            min={min}
            max={max}
          />
        )}
      </div>
      
      {error && (
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-error-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-error-600 font-medium">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default Input;