import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = '',
  footer
}) => {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: { maxWidth: '28rem' },
    md: { maxWidth: '32rem' },
    lg: { maxWidth: '42rem' },
    xl: { maxWidth: '56rem' }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: '0',
        zIndex: 50,
        overflowY: 'auto'
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        display: 'flex',
        minHeight: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(107, 114, 128, 0.75)',
          transition: 'opacity 0.3s ease-in-out'
        }} />
        
        <div 
          style={{
            position: 'relative',
            transform: 'translateY(0)',
            overflow: 'hidden',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--bg-primary, #ffffff)',
            textAlign: 'left',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            margin: '2rem 0',
            width: '100%',
            ...sizeStyles[size]
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className={className}
        >
          {title && (
            <div style={{
              backgroundColor: 'var(--bg-primary, #ffffff)',
              padding: '1.5rem',
              borderBottom: '1px solid var(--border-default, #e5e7eb)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h3 id="modal-title" style={{
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  color: 'var(--text-primary, #1f2937)',
                  margin: 0
                }}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  style={{
                    color: 'var(--text-muted, #9ca3af)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'color 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary, #6b7280)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted, #9ca3af)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-primary, #C8A968)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ 
                    position: 'absolute', 
                    width: '1px', 
                    height: '1px', 
                    padding: '0', 
                    margin: '-1px', 
                    overflow: 'hidden', 
                    clip: 'rect(0, 0, 0, 0)', 
                    whiteSpace: 'nowrap', 
                    border: '0' 
                  }}>Close</span>
                  <svg style={{ height: '1.5rem', width: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div style={{
            backgroundColor: 'var(--bg-primary, #ffffff)',
            padding: '1.5rem'
          }}>
            {children}
          </div>
          
          {footer && (
            <div style={{
              backgroundColor: 'var(--bg-secondary, #f9fafb)',
              padding: '1.5rem',
              borderTop: '1px solid var(--border-default, #e5e7eb)'
            }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;