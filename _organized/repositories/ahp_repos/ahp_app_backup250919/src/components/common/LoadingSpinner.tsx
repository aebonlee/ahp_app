import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  showText?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '', 
  text = 'Loading...',
  showText = true
}) => {
  const getSizeStyle = (size: string): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { height: '1rem', width: '1rem' };
      case 'lg':
        return { height: '3rem', width: '3rem' };
      default:
        return { height: '2rem', width: '2rem' };
    }
  };

  const spinnerStyle: React.CSSProperties = {
    ...getSizeStyle(size),
    color: 'var(--accent-primary, #C8A968)',
    animation: 'spin 1s linear infinite'
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      className={className}
      role="status" 
      aria-label="Loading..."
    >
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <svg
        style={spinnerStyle}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          style={{ opacity: 0.25 }}
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          style={{ opacity: 0.75 }}
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && showText && (
        <p style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary, #6b7280)',
          margin: '0.5rem 0 0 0'
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;