import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../hooks/useTheme';

const ThemeModeToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themeInfo = {
    light: { name: '라이트 모드', icon: '☀️', description: '밝은 테마로 전환' },
    dark: { name: '다크 모드', icon: '🌙', description: '어두운 테마로 전환' },
    system: { name: '시스템 설정', icon: '💻', description: '시스템 설정을 따름' }
  };

  const getCurrentIcon = () => {
    if (theme === 'system') return '💻';
    return resolvedTheme === 'dark' ? '🌙' : '☀️';
  };

  const getNextTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme);
    return themes[(currentIndex + 1) % themes.length];
  };

  const handleQuickToggle = () => {
    const nextTheme = getNextTheme();
    setTheme(nextTheme);
  };

  return (
    <>
      {/* Theme Mode Toggle Button */}
      <button
        onClick={handleQuickToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-light)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
        title={`현재: ${themeInfo[theme].name} (클릭: 다음 모드, 우클릭: 선택)`}
      >
        <span style={{
          fontSize: '1.25rem',
          transition: 'transform 0.3s ease'
        }}>
          {getCurrentIcon()}
        </span>
      </button>

      {/* Theme Mode Selection Modal */}
      {isOpen && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Backdrop */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div style={{
            position: 'relative',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-light)',
            maxWidth: '24rem',
            width: '100%',
            margin: '0 1rem'
          }}>
            
            {/* Header */}
            <div style={{
              padding: '1.5rem 1.5rem 1rem 1.5rem',
              borderBottom: '1px solid var(--border-light)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  {getCurrentIcon()} 모드 설정
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: '0.25rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-elevated)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'}
                >
                  <span style={{ color: 'var(--text-muted)' }}>✕</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              
              {/* Current Status */}
              <div style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                backgroundColor: 'var(--accent-light)',
                border: '1px solid var(--accent-primary)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{getCurrentIcon()}</span>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: 'var(--accent-primary)'
                    }}>
                      현재: {themeInfo[theme].name}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {theme === 'system' 
                        ? `시스템: ${resolvedTheme === 'dark' ? '다크' : '라이트'} 모드`
                        : themeInfo[theme].description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode Options */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {(['light', 'dark', 'system'] as const).map((themeOption) => {
                  const info = themeInfo[themeOption];
                  const isActive = theme === themeOption;
                  
                  return (
                    <button
                      key={themeOption}
                      onClick={() => {
                        setTheme(themeOption);
                        setIsOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: '1px solid',
                        backgroundColor: isActive ? 'var(--accent-light)' : 'var(--bg-elevated)',
                        borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-light)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
                      <div style={{
                        flex: 1,
                        textAlign: 'left'
                      }}>
                        <div style={{
                          fontWeight: '500',
                          color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)'
                        }}>
                          {info.name}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-muted)'
                        }}>
                          {info.description}
                        </div>
                      </div>
                      {isActive && (
                        <span style={{
                          fontSize: '1.125rem',
                          color: 'var(--accent-primary)'
                        }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Help Text */}
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)'
              }}>
                <p style={{
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5'
                }}>
                  <span>💡</span>
                  <span>
                    <strong>빠른 전환:</strong> 버튼 클릭으로 순환 전환<br />
                    <strong>세부 선택:</strong> 우클릭으로 모달 열기
                  </span>
                </p>
              </div>
              
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ThemeModeToggle;