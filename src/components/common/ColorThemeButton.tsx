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
    return themeInfo[currentTheme].emoji;
  };

  return (
    <>
      {/* Color Theme Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-light)',
          backdropFilter: 'blur(10px)'
        }}
        title={`현재: ${themeInfo[currentTheme].name}`}
      >
        <span className="text-xl group-hover:scale-110 transition-transform">
          {getCurrentThemeEmoji()}
        </span>
      </button>

      {/* Color Theme Selection Modal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative rounded-2xl shadow-2xl max-w-lg w-full mx-4"
               style={{
                 backgroundColor: 'var(--bg-secondary)',
                 borderRadius: 'var(--radius-lg)',
                 boxShadow: 'var(--shadow-2xl)',
                 border: '1px solid var(--border-light)'
               }}>
            
            {/* Header */}
            <div className="px-6 py-4 border-b"
                 style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}>
                  🎨 컬러 테마 선택
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span style={{ color: 'var(--text-muted)' }}>✕</span>
                </button>
              </div>
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
                    <span className="text-2xl">{themeInfo[currentTheme].emoji}</span>
                    현재: {themeInfo[currentTheme].name}
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