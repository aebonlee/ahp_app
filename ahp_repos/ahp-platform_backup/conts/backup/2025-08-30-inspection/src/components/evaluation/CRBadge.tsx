/**
 * 일관성 비율(CR) 상태 표시 배지 컴포넌트
 * CR 수치와 색상으로 일관성 상태를 시각적으로 표시
 */

import React from 'react';

interface CRBadgeProps {
  consistencyRatio: number;
  isComplete?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

type ConsistencyLevel = {
  level: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable';
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
};

const getConsistencyLevel = (cr: number): ConsistencyLevel => {
  if (cr <= 0.05) {
    return {
      level: 'excellent',
      label: '매우 일관적',
      description: '완벽한 일관성을 보입니다',
      color: 'text-green-800',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      icon: '🎯'
    };
  } else if (cr <= 0.08) {
    return {
      level: 'good',
      label: '일관성 양호',
      description: '좋은 일관성을 보입니다',
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      icon: '👍'
    };
  } else if (cr <= 0.10) {
    return {
      level: 'acceptable',
      label: '허용 가능',
      description: '허용 기준 내의 일관성입니다',
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      icon: '⚠️'
    };
  } else if (cr <= 0.15) {
    return {
      level: 'poor',
      label: '일관성 부족',
      description: '판단을 재검토해 주세요',
      color: 'text-orange-800',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      icon: '🔄'
    };
  } else {
    return {
      level: 'unacceptable',
      label: '매우 비일관적',
      description: '판단을 수정해야 합니다',
      color: 'text-red-800',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      icon: '❌'
    };
  }
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return {
        container: 'px-2 py-1 text-xs',
        crValue: 'text-sm font-bold',
        label: 'text-xs',
        icon: 'text-sm'
      };
    case 'lg':
      return {
        container: 'px-4 py-3 text-base',
        crValue: 'text-lg font-bold',
        label: 'text-sm',
        icon: 'text-lg'
      };
    default: // 'md'
      return {
        container: 'px-3 py-2 text-sm',
        crValue: 'text-base font-bold',
        label: 'text-sm',
        icon: 'text-base'
      };
  }
};

const CRBadge: React.FC<CRBadgeProps> = ({
  consistencyRatio,
  isComplete = true,
  showTooltip = true,
  size = 'md',
  onClick
}) => {
  const level = getConsistencyLevel(consistencyRatio);
  const sizeClasses = getSizeClasses(size);
  
  // 완료되지 않은 경우의 처리
  if (!isComplete) {
    return (
      <div className={`inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-gray-100 ${sizeClasses.container}`}>
        <span className={`${sizeClasses.icon}`}>⏳</span>
        <div>
          <div className={`${sizeClasses.crValue} text-gray-600`}>-</div>
          <div className={`${sizeClasses.label} text-gray-500`}>평가 진행 중</div>
        </div>
      </div>
    );
  }

  // CR 값이 비정상인 경우
  if (consistencyRatio > 999 || isNaN(consistencyRatio)) {
    return (
      <div className={`inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-gray-100 ${sizeClasses.container}`}>
        <span className={`${sizeClasses.icon}`}>⚠️</span>
        <div>
          <div className={`${sizeClasses.crValue} text-gray-600`}>오류</div>
          <div className={`${sizeClasses.label} text-gray-500`}>계산 오류</div>
        </div>
      </div>
    );
  }

  const badgeContent = (
    <div className={`
      inline-flex items-center space-x-2 rounded-lg border transition-all duration-200
      ${level.bgColor} ${level.borderColor} ${level.color} ${sizeClasses.container}
      ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
    `}>
      <span className={`${sizeClasses.icon}`}>{level.icon}</span>
      <div>
        <div className={`${sizeClasses.crValue}`}>
          CR: {consistencyRatio.toFixed(3)}
        </div>
        <div className={`${sizeClasses.label} opacity-90`}>
          {level.label}
        </div>
      </div>
    </div>
  );

  if (showTooltip) {
    return (
      <div className="relative group">
        <div onClick={onClick}>
          {badgeContent}
        </div>
        
        {/* 툴팁 */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
          <div className={`rounded-lg border shadow-lg p-3 ${level.bgColor} ${level.borderColor}`}>
            <div className={`font-medium ${level.color} mb-1`}>
              일관성 비율: {consistencyRatio.toFixed(3)}
            </div>
            <div className="text-sm text-gray-700 mb-2">
              {level.description}
            </div>
            
            {/* 일관성 기준 표시 */}
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span>매우 일관적</span>
                <span className="text-green-600">≤ 0.05</span>
              </div>
              <div className="flex items-center justify-between">
                <span>양호</span>
                <span className="text-blue-600">≤ 0.08</span>
              </div>
              <div className="flex items-center justify-between">
                <span>허용 가능</span>
                <span className="text-yellow-600">≤ 0.10</span>
              </div>
              <div className="flex items-center justify-between">
                <span>재검토 필요</span>
                <span className="text-red-600">&gt; 0.10</span>
              </div>
            </div>
            
            {/* 개선 제안 */}
            {level.level === 'poor' || level.level === 'unacceptable' && (
              <div className="mt-2 pt-2 border-t border-gray-300">
                <div className="text-xs text-gray-600">
                  💡 <strong>개선 방법:</strong> 판단 도우미를 사용하여 비일관적인 비교를 찾아 수정하세요.
                </div>
              </div>
            )}
            
            {/* 화살표 */}
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 ${level.bgColor} border-r ${level.borderColor} border-b rotate-45`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick}>
      {badgeContent}
    </div>
  );
};

// 일관성 상태에 따른 액션 버튼을 포함한 확장 버전
export const CRBadgeWithActions: React.FC<CRBadgeProps & {
  onShowHelper?: () => void;
  onShowDetails?: () => void;
}> = ({
  consistencyRatio,
  isComplete = true,
  onShowHelper,
  onShowDetails,
  ...props
}) => {
  const level = getConsistencyLevel(consistencyRatio);
  const needsImprovement = level.level === 'poor' || level.level === 'unacceptable';

  return (
    <div className="flex items-center space-x-2">
      <CRBadge 
        consistencyRatio={consistencyRatio}
        isComplete={isComplete}
        {...props}
      />
      
      {isComplete && needsImprovement && onShowHelper && (
        <button
          onClick={onShowHelper}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          📋 판단 도우미
        </button>
      )}
      
      {isComplete && onShowDetails && (
        <button
          onClick={onShowDetails}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          📊 상세 보기
        </button>
      )}
    </div>
  );
};

export default CRBadge;