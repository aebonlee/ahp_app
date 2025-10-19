import React, { useState, useEffect, useCallback } from 'react';
import { checkRateLimit } from '../../utils/security';

interface RateLimiterProps {
  children: React.ReactNode;
  identifier: string; // 사용자 ID, IP 주소 등
  maxRequests?: number;
  windowMs?: number; // 시간 윈도우 (밀리초)
  onRateLimitExceeded?: (resetTime: number) => void;
  showRemainingRequests?: boolean;
}

export const RateLimiter: React.FC<RateLimiterProps> = ({
  children,
  identifier,
  maxRequests = 100,
  windowMs = 15 * 60 * 1000, // 15분
  onRateLimitExceeded,
  showRemainingRequests = false
}) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [remaining, setRemaining] = useState(maxRequests);
  const [resetTime, setResetTime] = useState(Date.now() + windowMs);

  const checkLimit = useCallback(() => {
    const result = checkRateLimit(identifier, maxRequests, windowMs);
    
    setIsBlocked(!result.allowed);
    setRemaining(result.remaining);
    setResetTime(result.resetTime);
    
    if (!result.allowed && onRateLimitExceeded) {
      onRateLimitExceeded(result.resetTime);
    }
    
    return result.allowed;
  }, [identifier, maxRequests, windowMs, onRateLimitExceeded]);

  useEffect(() => {
    checkLimit();
  }, [checkLimit]);

  // 주기적으로 제한 상태 확인
  useEffect(() => {
    const interval = setInterval(() => {
      if (isBlocked && Date.now() >= resetTime) {
        checkLimit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlocked, resetTime, checkLimit]);

  const formatTimeRemaining = (resetTime: number): string => {
    const now = Date.now();
    const remaining = resetTime - now;
    
    if (remaining <= 0) return '곧';
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}분 ${seconds}초`;
    }
    return `${seconds}초`;
  };

  if (isBlocked) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-blocksy p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
          
          <h3 className="text-lg font-semibold text-red-800">
            요청 한도 초과
          </h3>
          
          <p className="text-red-700">
            너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.
          </p>
          
          <div className="bg-red-100 rounded-lg p-3 text-sm text-red-800">
            <p>
              다시 시도 가능한 시간: <strong>{formatTimeRemaining(resetTime)}</strong> 후
            </p>
          </div>
          
          <button
            onClick={checkLimit}
            className="px-4 py-2 bg-red-600 text-white rounded-blocksy hover:bg-red-700 transition-colors"
          >
            다시 확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {children}
      
      {showRemainingRequests && (
        <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-blocksy">
          남은 요청: {remaining}
        </div>
      )}
    </div>
  );
};

// Rate Limiting Hook
export const useRateLimit = (
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 15 * 60 * 1000
) => {
  const [state, setState] = useState({
    isAllowed: true,
    remaining: maxRequests,
    resetTime: Date.now() + windowMs
  });

  const checkLimit = useCallback(() => {
    const result = checkRateLimit(identifier, maxRequests, windowMs);
    setState({
      isAllowed: result.allowed,
      remaining: result.remaining,
      resetTime: result.resetTime
    });
    return result.allowed;
  }, [identifier, maxRequests, windowMs]);

  const waitForReset = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const checkReset = () => {
        if (Date.now() >= state.resetTime) {
          checkLimit();
          resolve();
        } else {
          setTimeout(checkReset, 1000);
        }
      };
      checkReset();
    });
  }, [state.resetTime, checkLimit]);

  return {
    ...state,
    checkLimit,
    waitForReset
  };
};

// API 요청에 Rate Limiting을 적용하는 HOC
export const withRateLimit = <T extends object>(
  Component: React.ComponentType<T>,
  rateLimitProps: Omit<RateLimiterProps, 'children'>
) => {
  return (props: T) => (
    <RateLimiter {...rateLimitProps}>
      <Component {...props} />
    </RateLimiter>
  );
};

// 특정 액션에 대한 Rate Limiting 컴포넌트
interface ActionRateLimiterProps {
  children: (executeAction: () => boolean) => React.ReactNode;
  identifier: string;
  maxRequests?: number;
  windowMs?: number;
  onLimitExceeded?: () => void;
}

export const ActionRateLimiter: React.FC<ActionRateLimiterProps> = ({
  children,
  identifier,
  maxRequests = 10,
  windowMs = 60 * 1000, // 1분
  onLimitExceeded
}) => {
  const executeAction = useCallback((): boolean => {
    const result = checkRateLimit(identifier, maxRequests, windowMs);
    
    if (!result.allowed && onLimitExceeded) {
      onLimitExceeded();
    }
    
    return result.allowed;
  }, [identifier, maxRequests, windowMs, onLimitExceeded]);

  return <>{children(executeAction)}</>;
};