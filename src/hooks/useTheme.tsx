import { useState, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import authService from '../services/authService';

export type Theme = 'light' | 'dark' | 'system';

const persistThemePreference = (themeMode: string, colorTheme?: string) => {
  const token = authService.getAccessToken();
  if (!token) return;
  fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    credentials: 'include',
    body: JSON.stringify({ preferences: { theme_mode: themeMode, ...(colorTheme ? { color_theme: colorTheme } : {}) } }),
  }).catch(() => {/* 프로필 API가 미지원이면 무시 */});
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // 사용자 프로필 API에서 로드 (초기값 system)
    return 'system';
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
    persistThemePreference(nextTheme);
  };

  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme);
    persistThemePreference(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme: setThemeMode,
  };
};

export default useTheme;