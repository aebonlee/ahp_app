import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: boolean;
  variant?: 'default' | 'gradient' | 'glass' | 'bordered' | 'elevated' | 'outlined' | 'flat' | 'filled';
  hoverable?: boolean;
  onClick?: () => void;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  className = '', 
  padding = true,
  variant = 'default',
  hoverable = false,
  onClick,
  rounded = 'md',
  shadow = 'md'
}) => {
  // CSS 변수 기반 variant 스타일
  const getVariantStyle = (variant: string) => {
    const baseStyle = {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    switch (variant) {
      case 'gradient':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, var(--bg-elevated), var(--accent-light))`,
          border: '1px solid var(--accent-primary)',
          backdropFilter: 'blur(10px)'
        };
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        };
      case 'bordered':
        return {
          ...baseStyle,
          backgroundColor: 'var(--card-bg)',
          border: '2px solid var(--accent-primary)'
        };
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: '2px solid var(--border-emphasis)',
        };
      case 'flat':
        return {
          ...baseStyle,
          backgroundColor: 'var(--bg-subtle)',
          border: 'none',
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: 'var(--accent-light)',
          border: '1px solid var(--accent-primary)',
          color: 'var(--accent-primary)'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)'
        };
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
        return { borderRadius: '24px' };
      default:
        return { borderRadius: '8px' };
    }
  };

  // 그림자 스타일
  const getShadowStyle = (shadow: string) => {
    switch (shadow) {
      case 'none':
        return { boxShadow: 'none' };
      case 'sm':
        return { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' };
      case 'md':
        return { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' };
      case 'lg':
        return { boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)' };
      case 'xl':
        return { boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)' };
      default:
        return { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' };
    }
  };


  const combinedStyle = {
    ...getVariantStyle(variant),
    ...getRoundedStyle(rounded),
    ...getShadowStyle(shadow),
    cursor: (hoverable || onClick) ? 'pointer' : 'default'
  };

  return (
    <div 
      onClick={onClick}
      className={className}
      style={combinedStyle}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = getShadowStyle('xl').boxShadow;
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = getShadowStyle(shadow).boxShadow;
        }
      }}>
      {title && (
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <h3 className="text-lg font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
    </div>
  );
};

export default Card;