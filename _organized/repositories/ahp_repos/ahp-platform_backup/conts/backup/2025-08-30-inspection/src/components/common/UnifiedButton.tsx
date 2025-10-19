import React from 'react';

interface UnifiedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const UnifiedButton: React.FC<UnifiedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  icon,
  title,
  style,
  onMouseEnter,
  onMouseLeave
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-luxury focus-luxury disabled:opacity-50 disabled:cursor-not-allowed border';
  
  const sizeClasses = {
    sm: 'min-w-[80px] px-3 py-2 text-sm',
    md: 'min-w-[100px] px-4 py-2.5 text-base', 
    lg: 'min-w-[120px] px-6 py-3 text-lg'
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-secondary))',
      color: 'white',
      borderColor: 'var(--gold-primary)',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-sm)',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    secondary: {
      background: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-medium)',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-sm)',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    info: {
      background: 'var(--color-info)',
      color: 'white',
      borderColor: 'var(--color-info)',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-sm)',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    success: {
      background: 'var(--color-success)',
      color: 'white',
      borderColor: 'var(--color-success)',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-sm)',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    warning: {
      background: 'var(--color-warning)',
      color: 'white', 
      borderColor: 'var(--color-warning)',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-sm)',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    danger: {
      background: 'var(--color-danger)',
      color: 'white',
      borderColor: 'var(--color-danger)',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-sm)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  };

  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  const buttonStyle = {
    ...variantStyles[variant],
    ...style, // Allow external styles to override
    cursor: disabled ? 'not-allowed' : 'pointer'
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onMouseEnter) {
      onMouseEnter(e);
    } else if (!disabled) {
      const element = e.currentTarget;
      element.style.transform = 'translateY(-2px) scale(1.02)';
      
      if (variant === 'primary') {
        element.style.background = 'linear-gradient(135deg, var(--gold-secondary), #8F7A3D)';
        element.style.boxShadow = 'var(--shadow-gold)';
      } else if (variant === 'secondary') {
        element.style.background = 'var(--bg-subtle)';
        element.style.borderColor = 'var(--border-strong)';
        element.style.boxShadow = 'var(--shadow-md)';
      } else {
        element.style.boxShadow = 'var(--shadow-lg)';
        element.style.filter = 'brightness(1.1)';
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onMouseLeave) {
      onMouseLeave(e);
    } else if (!disabled) {
      const element = e.currentTarget;
      element.style.transform = 'translateY(0) scale(1)';
      element.style.boxShadow = variantStyles[variant].boxShadow;
      element.style.background = variantStyles[variant].background;
      element.style.filter = 'none';
      
      if (variant === 'secondary') {
        element.style.borderColor = 'var(--border-medium)';
      }
    }
  };

  return (
    <button
      className={buttonClasses}
      style={{
        ...buttonStyle,
        fontWeight: 'var(--font-weight-semibold)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none'
      }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {icon && <span className="mr-2 text-lg">{icon}</span>}
      <span className="font-semibold">{children}</span>
    </button>
  );
};

export default UnifiedButton;