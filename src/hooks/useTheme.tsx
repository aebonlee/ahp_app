import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // localStorage 제거됨 - 사용자 프로필 API에서 불러오도록 개선 예정
    return 'system'; // 기본값
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (newTheme: 'light' | 'dark') => {
      setResolvedTheme(newTheme);
      if (newTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
    };

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    
    if (theme === 'system' && mediaQuery) {
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (theme !== 'system') {
      applyTheme(theme);
    }

    return () => {
      if (mediaQuery) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      }
    };
  }, [theme]);

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    // TODO: 사용자 프로필 API를 통해 테마 설정 저장
  };

  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme);
    // TODO: 사용자 프로필 API를 통해 테마 설정 저장
  };

  return {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme: setThemeMode,
  };
};

export default useTheme;