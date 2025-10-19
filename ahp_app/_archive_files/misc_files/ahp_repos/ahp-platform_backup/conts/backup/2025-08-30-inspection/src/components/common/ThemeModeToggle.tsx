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
        className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-light)',
          backdropFilter: 'blur(10px)'
        }}
        title={`현재: ${themeInfo[theme].name} (클릭: 다음 모드, 우클릭: 선택)`}
      >
        <span className="text-xl group-hover:scale-110 transition-transform">
          {getCurrentIcon()}
        </span>
      </button>

      {/* Theme Mode Selection Modal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative rounded-2xl shadow-2xl max-w-sm w-full mx-4"
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
                <h3 className="text-lg font-bold flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}>
                  {getCurrentIcon()} 모드 설정
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
            <div className="p-6 space-y-4">
              
              {/* Current Status */}
              <div className="p-4 rounded-xl"
                   style={{
                     backgroundColor: 'var(--accent-light)',
                     border: '1px solid var(--accent-primary)'
                   }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCurrentIcon()}</span>
                  <div>
                    <div className="font-semibold"
                         style={{ color: 'var(--accent-primary)' }}>
                      현재: {themeInfo[theme].name}
                    </div>
                    <div className="text-sm"
                         style={{ color: 'var(--text-secondary)' }}>
                      {theme === 'system' 
                        ? `시스템: ${resolvedTheme === 'dark' ? '다크' : '라이트'} 모드`
                        : themeInfo[theme].description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode Options */}
              <div className="space-y-2">
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
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                        isActive ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        backgroundColor: isActive ? 'var(--accent-light)' : 'var(--bg-elevated)',
                        borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-light)'
                      }}
                    >
                      <span className="text-2xl">{info.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium"
                             style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                          {info.name}
                        </div>
                        <div className="text-sm"
                             style={{ color: 'var(--text-muted)' }}>
                          {info.description}
                        </div>
                      </div>
                      {isActive && (
                        <span className="text-lg"
                              style={{ color: 'var(--accent-primary)' }}>
                          ✓
                        </span>
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
                <p className="text-xs flex items-start gap-2"
                   style={{ color: 'var(--text-muted)' }}>
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