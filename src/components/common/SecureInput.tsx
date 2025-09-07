import React, { useState, useEffect } from 'react';
import { sanitizeInput, isValidInput, isValidEmail, validatePassword } from '../../utils/security';

interface SecureInputProps {
  id?: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSecurityError?: (errors: string[]) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  allowHTML?: boolean;
  autoSanitize?: boolean;
  showPasswordStrength?: boolean;
  variant?: 'default' | 'filled' | 'bordered';
  error?: string;
}

const SecureInput: React.FC<SecureInputProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onSecurityError,
  disabled = false,
  required = false,
  className = '',
  rows = 3,
  maxLength = 1000,
  minLength = 0,
  allowHTML = false,
  autoSanitize = true,
  showPasswordStrength = true,
  variant = 'default',
  error
}) => {
  const [securityErrors, setSecurityErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[] } | null>(null);

  useEffect(() => {
    if (value) {
      const validation = isValidInput(value, { maxLength, minLength, allowHTML });
      setSecurityErrors(validation.errors);
      
      if (onSecurityError) {
        onSecurityError(validation.errors);
      }

      // 비밀번호 강도 검사
      if (type === 'password' && showPasswordStrength && value.length > 0) {
        const strength = validatePassword(value);
        setPasswordStrength(strength);
      } else {
        setPasswordStrength(null);
      }
    } else {
      setSecurityErrors([]);
      setPasswordStrength(null);
    }
  }, [value, maxLength, minLength, allowHTML, type, showPasswordStrength, onSecurityError]);

  // 이메일 특별 검증
  useEffect(() => {
    if (type === 'email' && value && !isValidEmail(value)) {
      setSecurityErrors(prev => [...prev, '올바른 이메일 형식이 아닙니다.']);
    }
  }, [value, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let inputValue = e.target.value;
    
    // 자동 sanitization
    if (autoSanitize && !allowHTML) {
      inputValue = sanitizeInput(inputValue);
    }
    
    onChange(inputValue);
  };

  const getPasswordStrengthColor = (score: number): string => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number): string => {
    if (score <= 1) return '매우 약함';
    if (score <= 2) return '약함';
    if (score <= 3) return '보통';
    if (score <= 4) return '강함';
    return '매우 강함';
  };

  // Variant 스타일
  const variantClasses = {
    default: 'border-gray-300 focus:border-primary-500',
    filled: 'bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500',
    bordered: 'border-2 border-gray-300 focus:border-primary-500'
  };

  const baseClasses = `
    block w-full px-4 py-3 text-neutral-900 placeholder-neutral-500
    border rounded-blocksy transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${securityErrors.length > 0 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${className}
  `.trim();

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={baseClasses}
          aria-describedby={securityErrors.length > 0 ? `${id}-security-errors` : undefined}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          className={baseClasses}
          aria-describedby={securityErrors.length > 0 ? `${id}-security-errors` : undefined}
        />
      )}

      {/* 비밀번호 강도 표시 */}
      {type === 'password' && showPasswordStrength && passwordStrength && value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${passwordStrength.score >= 4 ? 'text-green-600' : 'text-gray-600'}`}>
              {getPasswordStrengthText(passwordStrength.score)}
            </span>
          </div>
          
          {passwordStrength.feedback.length > 0 && (
            <div className="text-xs text-gray-600 space-y-1">
              {passwordStrength.feedback.map((feedback, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{feedback}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 일반 오류 표시 */}
      {error && (
        <div className="text-red-600 text-sm flex items-center space-x-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* 보안 오류 표시 */}
      {securityErrors.length > 0 && (
        <div id={`${id}-security-errors`} className="space-y-1">
          {securityErrors.map((securityError, index) => (
            <div key={index} className="flex items-center space-x-2 text-red-600 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>{securityError}</span>
            </div>
          ))}
        </div>
      )}

      {/* 문자수 표시 */}
      {maxLength && (
        <div className="flex justify-end">
          <span className={`text-xs ${value.length > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

export default SecureInput;