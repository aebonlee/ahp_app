import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { emojiToFontAwesome } from '../../utils/fontAwesome';

// UI 디자인 시스템 색상 팔레트
export const UIColors = {
  primary: '#3B82F6',     // 파란색 - 주요 액션
  secondary: '#6B7280',   // 회색 - 보조 액션
  success: '#10B981',     // 초록색 - 성공/완료
  warning: '#F59E0B',     // 주황색 - 경고/주의
  danger: '#EF4444',      // 빨간색 - 삭제/위험
  info: '#3B82F6',        // 정보색
  muted: '#9CA3AF',       // 연한 회색 - 비활성화
  text: '#111827',        // 텍스트
  background: '#F9FAFB'   // 배경
} as const;

// 아이콘 크기 시스템
export const UIIconSizes = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px  
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem'      // 48px
} as const;

// 아이콘 컨텍스트별 스타일 프리셋
export const UIIconPresets = {
  button: {
    size: 'base' as keyof typeof UIIconSizes,
    className: 'transition-colors duration-200'
  },
  navigation: {
    size: 'lg' as keyof typeof UIIconSizes,
    className: 'transition-all duration-200'
  },
  status: {
    size: 'sm' as keyof typeof UIIconSizes,
    className: 'inline-block'
  },
  hero: {
    size: '4xl' as keyof typeof UIIconSizes,
    className: 'drop-shadow-lg'
  },
  card: {
    size: '2xl' as keyof typeof UIIconSizes,
    className: 'mb-3'
  }
} as const;

interface UIIconProps {
  emoji?: string;
  icon?: string;
  preset?: keyof typeof UIIconPresets;
  size?: keyof typeof UIIconSizes;
  color?: keyof typeof UIColors | string;
  className?: string;
  hover?: boolean;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onClick?: () => void;
}

export const UIIcon: React.FC<UIIconProps> = ({
  emoji,
  icon,
  preset,
  size = 'base',
  color = 'text',
  className = '',
  hover = false,
  active = false,
  disabled = false,
  ariaLabel,
  onClick
}) => {
  // 프리셋이 있으면 우선 적용
  const appliedSize = preset ? UIIconPresets[preset].size : size;
  const presetClassName = preset ? UIIconPresets[preset].className : '';
  
  // 아이콘 이름 결정
  let iconName: string | null = null;
  
  if (emoji && emojiToFontAwesome[emoji as keyof typeof emojiToFontAwesome]) {
    iconName = emojiToFontAwesome[emoji as keyof typeof emojiToFontAwesome];
  } else if (icon) {
    iconName = icon;
  }
  
  // 색상 처리
  const colorValue = UIColors[color as keyof typeof UIColors] || color;
  
  // 클래스 이름 조합
  const combinedClassName = [
    presetClassName,
    className,
    hover && 'hover:opacity-80 cursor-pointer',
    active && 'opacity-90',
    disabled && 'opacity-50 cursor-not-allowed',
    onClick && 'cursor-pointer'
  ].filter(Boolean).join(' ');
  
  // 스타일 객체
  const iconStyle: React.CSSProperties = {
    color: colorValue,
    fontSize: UIIconSizes[appliedSize],
    transition: 'all 0.2s ease-in-out'
  };
  
  // Font Awesome 아이콘이 있으면 렌더링
  if (iconName) {
    return (
      <FontAwesomeIcon
        icon={['fas', iconName] as any}
        className={combinedClassName}
        style={iconStyle as any}
        aria-label={ariaLabel}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
      />
    );
  }
  
  // 이모지 폴백
  if (emoji) {
    return (
      <span
        className={combinedClassName}
        style={iconStyle as any}
        aria-label={ariaLabel}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
      >
        {emoji}
      </span>
    );
  }
  
  // 아무것도 없으면 null 반환
  return null;
};

// 자주 사용되는 아이콘들에 대한 shorthand 컴포넌트들
export const SearchIcon: React.FC<Omit<UIIconProps, 'emoji'>> = (props) => (
  <UIIcon emoji="🔍" ariaLabel="검색" {...props} />
);

export const EditIcon: React.FC<Omit<UIIconProps, 'emoji'>> = (props) => (
  <UIIcon emoji="📝" ariaLabel="편집" {...props} />
);

export const DeleteIcon: React.FC<Omit<UIIconProps, 'emoji'>> = (props) => (
  <UIIcon emoji="🗑️" ariaLabel="삭제" color="danger" {...props} />
);

export const SaveIcon: React.FC<Omit<UIIconProps, 'emoji'>> = (props) => (
  <UIIcon emoji="✅" ariaLabel="저장" color="success" {...props} />
);

export const AddIcon: React.FC<Omit<UIIconProps, 'emoji'>> = (props) => (
  <UIIcon emoji="➕" ariaLabel="추가" color="primary" {...props} />
);

export const SettingsIcon: React.FC<Omit<UIIconProps, 'emoji'>> = (props) => (
  <UIIcon emoji="⚙️" ariaLabel="설정" color="secondary" {...props} />
);

export default UIIcon;