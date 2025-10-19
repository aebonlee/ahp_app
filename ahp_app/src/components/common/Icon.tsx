import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { emojiToFontAwesome } from '../../utils/fontAwesome';

interface IconProps {
  emoji?: string;
  icon?: string;
  size?: 'xs' | 'sm' | 'lg' | '1x' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x';
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ 
  emoji, 
  icon, 
  size = '1x', 
  className = '', 
  style = {},
  color 
}) => {
  // 이모지가 제공된 경우 FontAwesome 아이콘으로 변환
  let iconName: string;
  
  if (emoji && emojiToFontAwesome[emoji as keyof typeof emojiToFontAwesome]) {
    iconName = emojiToFontAwesome[emoji as keyof typeof emojiToFontAwesome];
  } else if (icon) {
    iconName = icon;
  } else if (emoji) {
    // 매핑되지 않은 이모지는 그대로 표시
    return <span className={className} style={style}>{emoji}</span>;
  } else {
    return null;
  }

  const finalStyle = color ? { ...style, color } : style;

  return (
    <FontAwesomeIcon 
      icon={iconName as IconProp} 
      size={size} 
      className={className}
      style={finalStyle as any}
    />
  );
};

export default Icon;