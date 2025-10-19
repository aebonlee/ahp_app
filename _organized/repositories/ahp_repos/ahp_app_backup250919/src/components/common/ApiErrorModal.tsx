import React from 'react';

interface ApiErrorModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRetry: () => void;
}

const ApiErrorModal: React.FC<ApiErrorModalProps> = ({
  isVisible,
  onClose,
  onRetry
}) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-primary, #ffffff)',
        borderRadius: '0.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '28rem',
        width: '100%',
        padding: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            backgroundColor: 'var(--status-danger-bg, #fef2f2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.75rem'
          }}>
            <svg style={{
              width: '1.5rem',
              height: '1.5rem',
              color: 'var(--status-danger-text, #dc2626)'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--text-primary, #1f2937)',
            margin: 0
          }}>백엔드 API 연결 실패</h3>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            color: 'var(--text-secondary, #6b7280)',
            marginBottom: '1rem',
            margin: '0 0 1rem 0'
          }}>
            백엔드 서버에 연결할 수 없습니다. 서버 상태를 확인하고 다시 시도해주세요.
          </p>
          
          <div style={{
            backgroundColor: 'var(--accent-light, #E5D5AA)',
            border: '1px solid var(--accent-primary, #C8A968)',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <h4 style={{
              fontWeight: '500',
              color: 'var(--accent-secondary, #A98C4B)',
              marginBottom: '0.5rem',
              margin: '0 0 0.5rem 0'
            }}>🚀 백엔드 API 서버</h4>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--accent-secondary, #A98C4B)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <div>
                <strong>서버 주소:</strong> 
                <a href="https://ahp-platform.onrender.com" target="_blank" rel="noopener noreferrer" style={{
                  textDecoration: 'underline',
                  marginLeft: '0.25rem',
                  color: 'inherit'
                }}>
                  https://ahp-platform.onrender.com
                </a>
              </div>
              <div><strong>기능:</strong> PostgreSQL 데이터베이스, JWT 인증, 실시간 CRUD</div>
              <div><strong>상태:</strong> 서버가 깨어나는 중일 수 있습니다 (약 30초 소요)</div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <button
            onClick={onRetry}
            style={{
              width: '100%',
              backgroundColor: 'var(--accent-primary, #C8A968)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover, #B59A4D)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-primary, #C8A968)';
            }}
          >
            🔄 API 연결 재시도
          </button>
          
          <button
            onClick={onClose}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-elevated, #f3f4f6)',
              color: 'var(--text-secondary, #6b7280)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-muted, #e5e7eb)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated, #f3f4f6)';
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiErrorModal;