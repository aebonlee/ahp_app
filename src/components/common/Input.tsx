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
  variant = 'default'
}) => {
  // Base styles
  const baseStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '0.75rem 1rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '0.5rem',
    border: '1px solid',
    paddingLeft: icon ? '3rem' : '1rem'
  };
  
  // Variant styles
  const getVariantStyle = (variant: string): React.CSSProperties => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: 'var(--bg-elevated, #f9fafb)',
          borderColor: 'transparent',
          color: 'var(--text-primary, #1f2937)'
        };
      case 'bordered':
        return {
          backgroundColor: 'var(--bg-primary, #ffffff)',
          borderColor: 'var(--accent-primary, #C8A968)',
          borderWidth: '2px',
          color: 'var(--text-primary, #1f2937)'
        };
      default:
        return {
          backgroundColor: 'var(--bg-primary, #ffffff)',
          borderColor: 'var(--border-default, #d1d5db)',
          color: 'var(--text-primary, #1f2937)'
        };
    }
  };
  
  // State-based styles
  const getStateStyle = (): React.CSSProperties => {
    if (error) {
      return {
        borderColor: 'var(--status-danger-text, #ef4444)',
        backgroundColor: 'var(--status-danger-bg, #fef2f2)',
        color: 'var(--status-danger-text, #dc2626)'
      };
    }
    if (disabled) {
      return {
        backgroundColor: 'var(--bg-muted, #f3f4f6)',
        color: 'var(--text-muted, #9ca3af)',
        cursor: 'not-allowed',
        borderColor: 'var(--border-light, #e5e7eb)'
      };
    }
    return getVariantStyle(variant);
  };

  const inputStyle: React.CSSProperties = {
    ...baseStyle,
    ...getStateStyle()
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {label && (
        <label 
          htmlFor={id} 
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--text-primary, #374151)'
          }}
        >
          {label}
          {required && (
            <span style={{ 
              color: 'var(--status-danger-text, #ef4444)', 
              marginLeft: '0.25rem' 
            }}>*</span>
          )}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: '0',
            paddingLeft: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            color: 'var(--text-muted, #9ca3af)'
          }}>
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
            style={inputStyle}
            className={className}
            onFocus={(e) => {
              if (!disabled && !error) {
                e.currentTarget.style.borderColor = 'var(--accent-primary, #C8A968)';
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-focus, rgba(200, 169, 104, 0.35))';
              }
            }}
            onBlur={(e) => {
              if (!disabled && !error) {
                Object.assign(e.currentTarget.style, inputStyle);
              }
            }}
            onMouseEnter={(e) => {
              if (!disabled && !error) {
                e.currentTarget.style.borderColor = 'var(--accent-hover, #B59A4D)';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && !error) {
                Object.assign(e.currentTarget.style, inputStyle);
              }
            }}
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
            style={inputStyle}
            className={className}
            onFocus={(e) => {
              if (!disabled && !error) {
                e.currentTarget.style.borderColor = 'var(--accent-primary, #C8A968)';
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-focus, rgba(200, 169, 104, 0.35))';
              }
            }}
            onBlur={(e) => {
              if (!disabled && !error) {
                Object.assign(e.currentTarget.style, inputStyle);
              }
            }}
            onMouseEnter={(e) => {
              if (!disabled && !error) {
                e.currentTarget.style.borderColor = 'var(--accent-hover, #B59A4D)';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && !error) {
                Object.assign(e.currentTarget.style, inputStyle);
              }
            }}
          />
        )}
      </div>
      
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <svg 
            style={{ 
              width: '1rem', 
              height: '1rem', 
              color: 'var(--status-danger-text, #ef4444)' 
            }} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--status-danger-text, #dc2626)',
            fontWeight: '500',
            margin: 0
          }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default Input;