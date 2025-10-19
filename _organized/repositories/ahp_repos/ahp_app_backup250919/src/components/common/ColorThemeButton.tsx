import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useColorTheme, ColorTheme } from '../../hooks/useColorTheme';

const ColorThemeButton: React.FC = () => {
  const { currentTheme, changeColorTheme, getAvailableThemes, getPalette } = useColorTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeInfo: Record<ColorTheme, { name: string; emoji: string; description: string }> = {
    gold: { 
      name: 'Luxury Gold', 
      emoji: '🏆', 
      description: '고급스러운 골드 테마' 
    },
    blue: { 
      name: 'Ocean Blue', 
      emoji: '🌊', 
      description: '신뢰감 있는 블루 테마' 
    },
    green: { 
      name: 'Nature Green', 
      emoji: '🌿', 
      description: '자연친화적 그린 테마' 
    },
    purple: { 
      name: 'Royal Purple', 
      emoji: '👑', 
      description: '우아한 퍼플 테마' 
    },
    rose: { 
      name: 'Rose Pink', 
      emoji: '🌹', 
      description: '부드러운 로즈 테마' 
    },
    orange: { 
      name: 'Sunset Orange', 
      emoji: '🌅', 
      description: '활기찬 오렌지 테마' 
    },
    teal: { 
      name: 'Aqua Teal', 
      emoji: '💎', 
      description: '청량한 틸 테마' 
    },
    indigo: { 
      name: 'Deep Indigo', 
      emoji: '🌌', 
      description: '깊이 있는 인디고 테마' 
    },
    red: { 
      name: 'Vibrant Red', 
      emoji: '🔴', 
      description: '강렬한 레드 테마' 
    }
  };

  const handleThemeSelect = (theme: ColorTheme) => {
    changeColorTheme(theme);
    setIsOpen(false);
    // Add a smooth transition effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  };

  const getCurrentThemeEmoji = () => {
    return themeInfo[currentTheme]?.emoji || '🎨';
  };

  return (
    <>
      {/* Color Theme Button */}
      <button
        onClick={() => setIsOpen(true)}
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
        title={`현재: ${themeInfo[currentTheme]?.name || '기본 테마'}`}
      >
        <span style={{
          fontSize: '1.25rem',
          transition: 'transform 0.3s ease'
        }}>
          {getCurrentThemeEmoji()}
        </span>
      </button>

      {/* Color Theme Selection Modal */}
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
            maxWidth: '32rem',
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
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  🎨 컬러 테마 선택
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
              gap: '1.5rem'
            }}>
              
              {/* Current Theme Display */}
              <div style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '2px solid var(--accent-primary)',
                backgroundColor: 'var(--accent-light)',
                background: `linear-gradient(135deg, var(--accent-light), transparent)`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <h4 style={{
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-primary)'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{themeInfo[currentTheme]?.emoji || '🎨'}</span>
                    현재: {themeInfo[currentTheme]?.name || '기본 테마'}
                  </h4>
                </div>
                <p style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem'
                }}>
                  {themeInfo[currentTheme]?.description || '기본 설정'}
                </p>
              </div>

              {/* Theme Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '1rem'
              }}>
                {getAvailableThemes().map((theme) => {
                  const palette = getPalette(theme);
                  const info = themeInfo[theme];
                  const isActive = theme === currentTheme;

                  return (
                    <button
                      key={theme}
                      onClick={() => handleThemeSelect(theme)}
                      style={{
                        position: 'relative',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: '2px solid',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        backgroundColor: isActive ? palette.light : 'var(--bg-elevated)',
                        borderColor: isActive ? palette.primary : 'var(--border-light)',
                        boxShadow: isActive ? `0 4px 20px rgba(${palette.rgb}, 0.3), 0 0 0 2px ${palette.primary}, 0 0 0 4px var(--bg-secondary)` : 'var(--shadow-sm)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = palette.light;
                          e.currentTarget.style.borderColor = palette.primary;
                          e.currentTarget.style.boxShadow = `0 4px 20px rgba(${palette.rgb}, 0.2)`;
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                          e.currentTarget.style.borderColor = 'var(--border-light)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {/* Color Preview Circles */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '0.75rem',
                        gap: '0.5rem'
                      }}>
                        <div style={{ 
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '50%',
                          backgroundColor: palette.primary,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          transition: 'transform 0.3s ease'
                        }} />
                        <div style={{ 
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '50%',
                          backgroundColor: palette.secondary,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          transition: 'transform 0.3s ease'
                        }} />
                        <div style={{ 
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '50%',
                          backgroundColor: palette.light,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          transition: 'transform 0.3s ease'
                        }} />
                      </div>

                      {/* Theme Info */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '1.5rem',
                          lineHeight: '2rem',
                          marginBottom: '0.25rem'
                        }}>{info.emoji}</div>
                        <h5 style={{
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          marginBottom: '0.25rem',
                          color: isActive ? palette.primary : 'var(--text-primary)'
                        }}>
                          {info.name}
                        </h5>
                        <p style={{
                          fontSize: '0.75rem',
                          lineHeight: '1rem',
                          color: 'var(--text-muted)'
                        }}>
                          {info.description}
                        </p>
                      </div>

                      {/* Active Indicator */}
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          width: '1.5rem',
                          height: '1.5rem',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: palette.primary
                        }}>
                          <span style={{
                            color: 'white',
                            fontSize: '0.75rem',
                            lineHeight: '1rem'
                          }}>✓</span>
                        </div>
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
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-muted)'
                }}>
                  <span>🎨</span>
                  선택한 컬러 테마는 전체 인터페이스에 적용되며, 브라우저에 자동 저장됩니다.
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

export default ColorThemeButton;