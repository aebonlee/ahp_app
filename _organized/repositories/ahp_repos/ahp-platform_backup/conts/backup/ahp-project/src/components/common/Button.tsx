import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  style,
  onMouseEnter,
  onMouseLeave,
  rounded = 'md',
  title
}) => {
  // CSS 변수 기반 variant 스타일
  const getVariantStyle = (variant: string) => {
    const baseStyle = {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      outline: 'none',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: 'var(--accent-primary)',
          color: 'white',
          border: '1px solid var(--accent-primary)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: 'var(--status-success-text)',
          color: 'white',
          border: '1px solid var(--status-success-text)',
          boxShadow: '0 1px 3px rgba(16, 185, 129, 0.2)',
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: 'var(--status-warning-text)',
          color: 'white',
          border: '1px solid var(--status-warning-text)',
          boxShadow: '0 1px 3px rgba(245, 158, 11, 0.2)',
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: 'var(--status-danger-text)',
          color: 'white',
          border: '1px solid var(--status-danger-text)',
          boxShadow: '0 1px 3px rgba(239, 68, 68, 0.2)',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: 'var(--accent-primary)',
          border: '2px solid var(--accent-primary)',
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: 'none',
        };
      default:
        return baseStyle;
    }
  };

  // 호버 효과
  const getHoverStyle = (variant: string) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--accent-hover)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.3)',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-muted)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        };
      case 'success':
        return {
          backgroundColor: '#047857', // darker green
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        };
      case 'warning':
        return {
          backgroundColor: '#92400e', // darker amber
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
        };
      case 'error':
        return {
          backgroundColor: '#991b1b', // darker red
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        };
      case 'outline':
        return {
          backgroundColor: 'var(--accent-primary)',
          color: 'white',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.2)',
        };
      case 'ghost':
        return {
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
        };
      default:
        return {};
    }
  };

  // 크기별 스타일
  const getSizeStyle = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          padding: '8px 16px',
          fontSize: '0.875rem',
          minHeight: '36px',
        };
      case 'md':
        return {
          padding: '12px 24px',
          fontSize: '0.875rem',
          minHeight: '44px',
        };
      case 'lg':
        return {
          padding: '16px 32px',
          fontSize: '1rem',
          minHeight: '52px',
        };
      case 'xl':
        return {
          padding: '20px 40px',
          fontSize: '1.125rem',
          minHeight: '60px',
        };
      default:
        return {};
    }
  };

  // 라운드 처리 스타일
  const getRoundedStyle = (rounded: string) => {
    switch (rounded) {
      case 'none':
        return { borderRadius: '0' };
      case 'sm':
        return { borderRadius: '4px' };
      case 'md':
        return { borderRadius: '8px' };
      case 'lg':
        return { borderRadius: '12px' };
      case 'xl':
        return { borderRadius: '16px' };
      case 'full':
        return { borderRadius: '9999px' };
      default:
        return { borderRadius: '8px' };
    }
  };

  // 포커스 스타일
  const getFocusStyle = () => ({
    boxShadow: `0 0 0 3px var(--accent-focus)`,
  });

  const combinedStyle = {
    ...getVariantStyle(variant),
    ...getSizeStyle(size),
    ...getRoundedStyle(rounded),
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={combinedStyle}
      title={title}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          const hoverStyle = getHoverStyle(variant);
          Object.assign(e.currentTarget.style, hoverStyle);
        }
        if (onMouseEnter) onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          // 기본 스타일로 복원
          Object.assign(e.currentTarget.style, combinedStyle);
        }
        if (onMouseLeave) onMouseLeave(e);
      }}
      onFocus={(e) => {
        if (!disabled && !loading) {
          const focusStyle = getFocusStyle();
          Object.assign(e.currentTarget.style, { ...combinedStyle, ...focusStyle });
        }
      }}
      onBlur={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, combinedStyle);
        }
      }}
    >
      {loading && (
        <svg 
          className="animate-spin mr-3 h-5 w-5" 
          style={{ marginRight: '8px' }}
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            style={{ opacity: 0.25 }}
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            style={{ opacity: 0.75 }}
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;