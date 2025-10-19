import React from 'react';
import UIIcon from './UIIcon';
import { UIColors } from './UIIcon';

interface UIButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
  iconEmoji?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

const UIButton: React.FC<UIButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconEmoji,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = false,
  className = '',
  onClick,
  type = 'button',
  ariaLabel
}) => {
  // 버튼 크기별 스타일
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  // 버튼 변형별 스타일
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
      text-white border-transparent shadow-md hover:shadow-lg
      focus:ring-4 focus:ring-blue-200
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300
      focus:ring-4 focus:ring-gray-200
    `,
    success: `
      bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
      text-white border-transparent shadow-md hover:shadow-lg
      focus:ring-4 focus:ring-green-200
    `,
    warning: `
      bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700
      text-white border-transparent shadow-md hover:shadow-lg
      focus:ring-4 focus:ring-yellow-200
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
      text-white border-transparent shadow-md hover:shadow-lg
      focus:ring-4 focus:ring-red-200
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 text-gray-600 border-transparent
      focus:ring-4 focus:ring-gray-200
    `
  };

  // 아이콘 색상 매핑
  const iconColorMap = {
    primary: 'white',
    secondary: UIColors.text,
    success: 'white',
    warning: 'white',
    danger: 'white',
    ghost: UIColors.secondary
  };

  // 조합된 클래스명
  const combinedClassName = [
    // 기본 스타일
    'inline-flex items-center justify-center',
    'border font-medium transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-offset-2',
    'transform hover:scale-105 active:scale-95',
    
    // 크기 스타일
    sizeStyles[size],
    
    // 변형 스타일
    variantStyles[variant],
    
    // 조건부 스타일
    rounded ? 'rounded-full' : 'rounded-lg',
    fullWidth ? 'w-full' : '',
    loading || disabled ? 'opacity-50 cursor-not-allowed transform-none' : 'cursor-pointer',
    
    // 사용자 정의 클래스
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const iconSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : size === 'xl' ? 'xl' : 'base';
  const iconColor = iconColorMap[variant];

  const renderIcon = () => {
    if (loading) {
      return (
        <UIIcon 
          icon="spinner" 
          size={iconSize} 
          color={iconColor}
          className="animate-spin"
        />
      );
    }
    
    if (iconEmoji || icon) {
      return (
        <UIIcon 
          emoji={iconEmoji}
          icon={icon}
          size={iconSize}
          color={iconColor}
        />
      );
    }
    
    return null;
  };

  const iconElement = renderIcon();

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={combinedClassName}
      aria-label={ariaLabel}
    >
      {iconElement && iconPosition === 'left' && (
        <span className="mr-2">{iconElement}</span>
      )}
      
      {loading ? '처리중...' : children}
      
      {iconElement && iconPosition === 'right' && (
        <span className="ml-2">{iconElement}</span>
      )}
    </button>
  );
};

// 자주 사용되는 버튼들에 대한 프리셋 컴포넌트
export const PrimaryButton: React.FC<Omit<UIButtonProps, 'variant'>> = (props) => (
  <UIButton variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<UIButtonProps, 'variant'>> = (props) => (
  <UIButton variant="secondary" {...props} />
);

export const SuccessButton: React.FC<Omit<UIButtonProps, 'variant'>> = (props) => (
  <UIButton variant="success" {...props} />
);

export const DangerButton: React.FC<Omit<UIButtonProps, 'variant'>> = (props) => (
  <UIButton variant="danger" {...props} />
);

export const GhostButton: React.FC<Omit<UIButtonProps, 'variant'>> = (props) => (
  <UIButton variant="ghost" {...props} />
);

export default UIButton;