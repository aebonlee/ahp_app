import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useColorTheme, ColorTheme } from '../../hooks/useColorTheme';

const ColorThemeSelector: React.FC = () => {
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
    // Add a smooth transition effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium transition-luxury rounded-lg group hover:scale-105"
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}
        title="컬러 테마 선택"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
          e.currentTarget.style.boxShadow = 'var(--shadow-accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'var(--border-medium)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        <span className="text-lg mr-2">🎨</span>
        <span className="hidden sm:inline font-medium">컬러 테마</span>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popup Content */}
          <div className="relative rounded-xl shadow-2xl max-w-lg w-full mx-4"
               style={{
                 backgroundColor: 'var(--bg-secondary)',
                 borderRadius: 'var(--radius-lg)',
                 boxShadow: 'var(--shadow-xl)'
               }}>
            
            {/* Header */}
            <div className="px-6 py-4 border-b"
                 style={{ borderColor: 'var(--border-light)' }}>
              <h3 className="text-xl font-bold flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}>
                🎨 컬러 테마 선택
              </h3>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Current Theme Display */}
              <div className="p-4 rounded-xl border-2"
                   style={{
                     backgroundColor: 'var(--accent-light)',
                     borderColor: 'var(--accent-primary)',
                     background: `linear-gradient(135deg, var(--accent-light), transparent)`
                   }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold flex items-center gap-2"
                      style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-base)' }}>
                    <span className="text-xl">{themeInfo[currentTheme].emoji}</span>
                    현재 테마: {themeInfo[currentTheme].name}
                  </h4>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {themeInfo[currentTheme].description}
                </p>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-3 gap-4">
                {getAvailableThemes().map((theme) => {
                  const palette = getPalette(theme);
                  const info = themeInfo[theme];
                  const isActive = theme === currentTheme;

                  return (
                    <button
                      key={theme}
                      onClick={() => handleThemeSelect(theme)}
                      className={`group relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        isActive ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        backgroundColor: isActive ? palette.light : 'var(--bg-elevated)',
                        borderColor: isActive ? palette.primary : 'var(--border-light)',
                        boxShadow: isActive ? `0 4px 20px rgba(${palette.rgb}, 0.3)` : 'var(--shadow-sm)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = palette.light;
                          e.currentTarget.style.borderColor = palette.primary;
                          e.currentTarget.style.boxShadow = `0 4px 20px rgba(${palette.rgb}, 0.2)`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                          e.currentTarget.style.borderColor = 'var(--border-light)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }
                      }}
                    >
                      {/* Color Preview Circles */}
                      <div className="flex justify-center mb-3 space-x-2">
                        <div className="w-8 h-8 rounded-full shadow-md transition-transform group-hover:scale-110"
                             style={{ backgroundColor: palette.primary }} />
                        <div className="w-8 h-8 rounded-full shadow-md transition-transform group-hover:scale-110"
                             style={{ backgroundColor: palette.secondary }} />
                        <div className="w-8 h-8 rounded-full shadow-md transition-transform group-hover:scale-110"
                             style={{ backgroundColor: palette.light }} />
                      </div>

                      {/* Theme Info */}
                      <div className="text-center">
                        <div className="text-2xl mb-1">{info.emoji}</div>
                        <h5 className="font-bold text-sm mb-1"
                            style={{ color: isActive ? palette.primary : 'var(--text-primary)' }}>
                          {info.name}
                        </h5>
                        <p className="text-xs"
                           style={{ color: 'var(--text-muted)' }}>
                          {info.description}
                        </p>
                      </div>

                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                             style={{ backgroundColor: palette.primary }}>
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Help Text */}
              <div className="p-3 rounded-lg"
                   style={{ 
                     backgroundColor: 'var(--bg-elevated)',
                     border: '1px solid var(--border-light)'
                   }}>
                <p className="text-sm flex items-center gap-2"
                   style={{ color: 'var(--text-muted)' }}>
                  <span>💡</span>
                  선택한 컬러 테마는 전체 인터페이스에 적용되며, 브라우저에 자동 저장됩니다.
                </p>
              </div>
              
              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  완료
                </button>
              </div>
              
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ColorThemeSelector;