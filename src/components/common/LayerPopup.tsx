import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface LayerPopupProps {
  trigger: React.ReactNode;
  title: string;
  content: string | React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'center' | 'near-trigger';
  className?: string;
}

const LayerPopup: React.FC<LayerPopupProps> = ({ 
  trigger, 
  title, 
  content, 
  width = 'md',
  position = 'center',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const handleOpen = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // 외부 클릭으로 닫기
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && popupRef.current && !popupRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getPopupStyle = () => {
    if (position === 'near-trigger' && triggerRect) {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const popupHeight = 400; // 예상 높이
      const popupWidth = width === 'sm' ? 384 : width === 'md' ? 448 : width === 'lg' ? 512 : 576;

      let top = triggerRect.bottom + 8;
      let left = triggerRect.left;

      // 화면을 벗어나는 경우 조정
      if (top + popupHeight > viewportHeight) {
        top = triggerRect.top - popupHeight - 8;
      }
      if (left + popupWidth > viewportWidth) {
        left = viewportWidth - popupWidth - 16;
      }
      if (left < 16) {
        left = 16;
      }

      return {
        position: 'fixed' as const,
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999
      };
    }

    return {};
  };

  const popup = isOpen ? createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* 팝업 컨텐츠 */}
      <div 
        ref={popupRef}
        className={`
          relative bg-white rounded-xl shadow-xl border border-gray-200 
          ${widthClasses[width]} w-full mx-4 max-h-[80vh] overflow-hidden
          animate-in fade-in-0 zoom-in-95 duration-200
          ${className}
        `}
        style={position === 'near-trigger' ? getPopupStyle() : {}}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {title}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 컨텐츠 */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {typeof content === 'string' ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          ) : (
            content
          )}
        </div>
        
        {/* 푸터 */}
        <div className="flex justify-end p-6 pt-0">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div ref={triggerRef} onClick={handleOpen} className="inline-block cursor-pointer">
        {trigger}
      </div>
      {popup}
    </>
  );
};

export default LayerPopup;