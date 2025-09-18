// =============================================================================
// AHP Enterprise Platform - Loading Spinner Component (3차 개발)
// =============================================================================

import React from 'react';
import { LoadingState } from '../../types';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  progress?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = '로딩 중...', 
  size = 'md',
  progress,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${containerClasses[size]} ${className}`}>
      {/* Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin`}>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
      
      {/* Message */}
      {message && (
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">
          {message}
        </p>
      )}
      
      {/* Progress Bar */}
      {typeof progress === 'number' && (
        <div className="mt-4 w-full max-w-xs">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
            {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
};

// Page-level loading component
export const PageLoading: React.FC<{ message?: string }> = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <LoadingSpinner size="lg" message={message} />
  </div>
);

// Inline loading component
export const InlineLoading: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="sm" message={message} />
  </div>
);

export default LoadingSpinner;