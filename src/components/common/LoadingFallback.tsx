import React from 'react';

interface LoadingFallbackProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = '로딩 중...',
  fullScreen = false,
}) => {
  const containerClass = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center py-16';

  return (
    <div className={containerClass} style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderColor: 'var(--accent-primary, #3B82F6)' }}
        />
        <p className="text-sm" style={{ color: 'var(--text-secondary, #6B7280)' }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingFallback;
