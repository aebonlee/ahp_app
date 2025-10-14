import React from 'react';

interface PageHeaderProps {
  /** 페이지 제목 */
  title: string;
  /** 페이지 설명 */
  description?: string;
  /** 아이콘 (이모지 또는 SVG) */
  icon?: React.ReactNode;
  /** 뒤로가기 버튼 클릭 핸들러 */
  onBack?: () => void;
  /** 오른쪽 액션 버튼들 */
  actions?: React.ReactNode;
  /** 헤더 하단에 추가 콘텐츠 */
  children?: React.ReactNode;
  /** 사용자 정의 클래스명 */
  className?: string;
}

/**
 * 표준화된 페이지 헤더 컴포넌트
 * 
 * 모든 페이지에서 일관된 헤더 디자인을 제공합니다.
 * Sticky 헤더, 반응형 레이아웃, 뒤로가기 버튼 등을 포함합니다.
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  onBack,
  actions,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 sticky top-0 z-10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between">
            {/* 왼쪽 영역: 뒤로가기 + 제목 */}
            <div className="flex items-center">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                  title="뒤로가기"
                >
                  ←
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  {icon && (
                    <span className="text-4xl mr-3">
                      {icon}
                    </span>
                  )}
                  {title}
                </h1>
                {description && (
                  <p className="text-gray-600 mt-2">
                    {description}
                  </p>
                )}
              </div>
            </div>
            
            {/* 오른쪽 영역: 액션 버튼들 */}
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
          
          {/* 추가 콘텐츠 영역 */}
          {children && (
            <div className="mt-6">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;