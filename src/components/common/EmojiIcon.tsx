import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { emojiToFontAwesome } from '../../utils/fontAwesome';

interface EmojiIconProps {
  emoji: string;
  className?: string;
  size?: 'xs' | 'sm' | 'lg' | '1x' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x';
  fallbackToEmoji?: boolean;
}

export const EmojiIcon: React.FC<EmojiIconProps> = ({
  emoji,
  className = '',
  size = '1x',
  fallbackToEmoji = true
}) => {
  const iconName = emojiToFontAwesome[emoji as keyof typeof emojiToFontAwesome];
  
  if (iconName) {
    return (
      <FontAwesomeIcon
        icon={['fas', iconName] as any}
        size={size}
        className={className}
      />
    );
  }
  
  // FontAwesome 아이콘이 없는 경우 원래 이모지를 표시하거나 빈 span 반환
  if (fallbackToEmoji) {
    return <span className={className}>{emoji}</span>;
  }
  
  return <span className={className}></span>;
};

export default EmojiIcon;