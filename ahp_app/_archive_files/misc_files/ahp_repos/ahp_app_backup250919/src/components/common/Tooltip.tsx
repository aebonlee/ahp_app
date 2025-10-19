import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top', 
  delay = 500,
  disabled = false,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled || !content) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // 툴팁 위치 조정 (화면 경계 체크)
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newPosition = position;

      // 화면 경계를 벗어나면 위치 조정
      switch (position) {
        case 'top':
          if (rect.top < tooltipRect.height + 10) {
            newPosition = 'bottom';
          }
          break;
        case 'bottom':
          if (rect.bottom + tooltipRect.height + 10 > viewportHeight) {
            newPosition = 'top';
          }
          break;
        case 'left':
          if (rect.left < tooltipRect.width + 10) {
            newPosition = 'right';
          }
          break;
        case 'right':
          if (rect.right + tooltipRect.width + 10 > viewportWidth) {
            newPosition = 'left';
          }
          break;
      }

      setActualPosition(newPosition);
    }
  }, [isVisible, position]);

  const getPositionClasses = () => {
    const baseClasses = "absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm transition-opacity duration-200";
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = "absolute w-2 h-2 bg-gray-900 transform rotate-45";
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 -translate-y-1`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 translate-y-1`;
      case 'left':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 -translate-x-1`;
      case 'right':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 translate-x-1`;
      default:
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 -translate-y-1`;
    }
  };

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={getPositionClasses()}
          style={{ 
            opacity: isVisible ? 1 : 0,
            pointerEvents: 'none',
            maxWidth: '250px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {content}
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;