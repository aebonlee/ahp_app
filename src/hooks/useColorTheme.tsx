import { useState, useEffect } from 'react';

export type ColorTheme = 'gold' | 'blue' | 'green' | 'purple' | 'rose' | 'orange' | 'teal' | 'indigo' | 'red';

interface ColorPalette {
  primary: string;
  secondary: string;
  light: string;
  hover: string;
  focus: string;
  rgb: string; // For opacity variations
}

// Define color palettes inspired by modern design systems
const colorPalettes: Record<ColorTheme, ColorPalette> = {
  gold: {
    primary: '#C8A968',
    secondary: '#A98C4B',
    light: '#E5D5AA',
    hover: '#B59A4D',
    focus: 'rgba(200, 169, 104, 0.35)',
    rgb: '200, 169, 104'
  },
  blue: {
    primary: '#3B82F6',
    secondary: '#2563EB',
    light: '#93C5FD',
    hover: '#1D4ED8',
    focus: 'rgba(59, 130, 246, 0.35)',
    rgb: '59, 130, 246'
  },
  green: {
    primary: '#10B981',
    secondary: '#059669',
    light: '#86EFAC',
    hover: '#047857',
    focus: 'rgba(16, 185, 129, 0.35)',
    rgb: '16, 185, 129'
  },
  purple: {
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    light: '#C4B5FD',
    hover: '#6D28D9',
    focus: 'rgba(139, 92, 246, 0.35)',
    rgb: '139, 92, 246'
  },
  rose: {
    primary: '#F43F5E',
    secondary: '#E11D48',
    light: '#FDA4AF',
    hover: '#BE123C',
    focus: 'rgba(244, 63, 94, 0.35)',
    rgb: '244, 63, 94'
  },
  orange: {
    primary: '#F97316',
    secondary: '#EA580C',
    light: '#FDBA74',
    hover: '#DC2626',
    focus: 'rgba(249, 115, 22, 0.35)',
    rgb: '249, 115, 22'
  },
  teal: {
    primary: '#14B8A6',
    secondary: '#0D9488',
    light: '#5EEAD4',
    hover: '#0F766E',
    focus: 'rgba(20, 184, 166, 0.35)',
    rgb: '20, 184, 166'
  },
  indigo: {
    primary: '#6366F1',
    secondary: '#4F46E5',
    light: '#A5B4FC',
    hover: '#4338CA',
    focus: 'rgba(99, 102, 241, 0.35)',
    rgb: '99, 102, 241'
  },
  red: {
    primary: '#EF4444',
    secondary: '#DC2626',
    light: '#FCA5A5',
    hover: '#B91C1C',
    focus: 'rgba(239, 68, 68, 0.35)',
    rgb: '239, 68, 68'
  }
};

// Apply initial gold theme immediately to prevent flash and ensure stable layout
const applyInitialTheme = () => {
  const root = document.documentElement;
  const goldPalette = colorPalettes.gold;
  
  if (goldPalette) {
    // Core accent colors
    root.style.setProperty('--accent-primary', goldPalette.primary);
    root.style.setProperty('--accent-secondary', goldPalette.secondary);
    root.style.setProperty('--accent-light', goldPalette.light);
    root.style.setProperty('--accent-hover', goldPalette.hover);
    root.style.setProperty('--accent-focus', goldPalette.focus);
    root.style.setProperty('--accent-rgb', goldPalette.rgb);
    
    // Legacy compatibility
    root.style.setProperty('--gold-primary', goldPalette.primary);
    root.style.setProperty('--gold-secondary', goldPalette.secondary);
    root.style.setProperty('--gold-light', goldPalette.light);
    
    // Interactive elements
    root.style.setProperty('--interactive-primary', goldPalette.primary);
    root.style.setProperty('--interactive-primary-hover', goldPalette.hover);
    root.style.setProperty('--interactive-primary-light', goldPalette.light);
    root.style.setProperty('--interactive-secondary', goldPalette.secondary);
    
    // Component specific colors
    root.style.setProperty('--favorite-bg', goldPalette.light);
    root.style.setProperty('--favorite-border', goldPalette.primary);
    root.style.setProperty('--favorite-text', goldPalette.secondary);
    root.style.setProperty('--favorite-hover-bg', goldPalette.primary);
    
    // Effects
    root.style.setProperty('--shadow-focus', goldPalette.focus);
    root.style.setProperty('--focus', goldPalette.focus);
    root.style.setProperty('--ring', goldPalette.primary);
    root.style.setProperty('--border-focus', goldPalette.primary);
    root.style.setProperty('--shadow-accent', `0 4px 20px rgba(${goldPalette.rgb}, 0.25)`);
    root.style.setProperty('--shadow-gold', `0 4px 20px rgba(${goldPalette.rgb}, 0.25)`);
    
    // AHP specific
    root.style.setProperty('--ahp-primary', goldPalette.primary);
  }
};

// Apply theme immediately on module load
applyInitialTheme();

export const useColorTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(() => {
    // Theme is managed by server session - default to gold
    // Server will provide user's theme preference through API
    return 'gold';
  });

  // Apply color theme to CSS variables
  const applyColorTheme = (theme: ColorTheme): void => {
    const palette = colorPalettes[theme];
    
    // Guard clause: if palette is undefined, fall back to gold theme
    if (!palette) {
      console.warn(`Color theme '${theme}' not found, falling back to 'gold' theme`);
      const fallbackPalette = colorPalettes.gold;
      if (!fallbackPalette) return; // Exit if even gold theme is missing
      return applyColorTheme('gold');
    }
    
    const root = document.documentElement;

    // Update CSS variables with new color palette
    root.style.setProperty('--accent-primary', palette.primary);
    root.style.setProperty('--accent-secondary', palette.secondary);
    root.style.setProperty('--accent-light', palette.light);
    root.style.setProperty('--accent-hover', palette.hover);
    root.style.setProperty('--accent-focus', palette.focus);
    root.style.setProperty('--accent-rgb', palette.rgb);

    // Legacy variable support
    root.style.setProperty('--gold-primary', palette.primary);
    root.style.setProperty('--gold-secondary', palette.secondary);
    root.style.setProperty('--gold-light', palette.light);
    root.style.setProperty('--accent-gold', palette.primary);
    root.style.setProperty('--accent-gold-2', palette.secondary);

    // Update shadows with theme color
    root.style.setProperty('--shadow-gold', `0 4px 20px rgba(${palette.rgb}, 0.25)`);
    root.style.setProperty('--shadow-accent', `0 4px 20px rgba(${palette.rgb}, 0.25)`);
    
    // Update focus shadow
    root.style.setProperty('--shadow-focus', palette.focus);
    root.style.setProperty('--focus', palette.focus);
    
    // Update border focus color
    root.style.setProperty('--border-focus', palette.primary);
    root.style.setProperty('--ring', palette.primary);

    // Update AHP specific colors
    root.style.setProperty('--ahp-primary', palette.primary);
    
    // Update semantic theme colors
    root.style.setProperty('--interactive-primary', palette.primary);
    root.style.setProperty('--interactive-primary-hover', palette.hover);
    root.style.setProperty('--interactive-primary-light', palette.light);
    root.style.setProperty('--interactive-secondary', palette.secondary);
    
    root.style.setProperty('--favorite-bg', palette.light);
    root.style.setProperty('--favorite-border', palette.primary);
    root.style.setProperty('--favorite-text', palette.secondary);
    root.style.setProperty('--favorite-hover-bg', palette.primary);
    
    root.style.setProperty('--user-avatar-bg', `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`);
    
    // For dark mode adjustments
    if (root.getAttribute('data-theme') === 'dark') {
      // Brighten colors slightly for dark mode
      const brightenColor = (hex: string) => {
        const num = parseInt(hex.slice(1), 16);
        const amt = 40;
        const r = Math.min(255, (num >> 16) + amt);
        const g = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const b = Math.min(255, (num & 0x0000FF) + amt);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
      };
      
      root.style.setProperty('--accent-primary', brightenColor(palette.primary));
      root.style.setProperty('--gold-primary', brightenColor(palette.primary));
    }
  };

  // Apply theme on mount and changes
  useEffect(() => {
    applyColorTheme(currentTheme);
  }, [currentTheme]);

  // Change theme and persist to server
  const changeColorTheme = async (theme: ColorTheme) => {
    setCurrentTheme(theme);
    // Save theme preference to server instead of localStorage
    try {
      await fetch('/api/user/theme/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme })
      });
    } catch (error) {
      console.error('Failed to save theme to server:', error);
    }
  };

  // Get all available themes
  const getAvailableThemes = (): ColorTheme[] => {
    return Object.keys(colorPalettes) as ColorTheme[];
  };

  // Get palette for specific theme
  const getPalette = (theme?: ColorTheme): ColorPalette => {
    const targetTheme = theme || currentTheme;
    const palette = colorPalettes[targetTheme];
    
    // If palette doesn't exist, return gold theme as fallback
    if (!palette) {
      console.warn(`Color palette for theme '${targetTheme}' not found, falling back to 'gold'`);
      return colorPalettes.gold || {
        primary: '#C8A968',
        secondary: '#A98C4B',
        light: '#E5D5AA',
        hover: '#B59A4D',
        focus: 'rgba(200, 169, 104, 0.35)',
        rgb: '200, 169, 104'
      };
    }
    
    return palette;
  };

  return {
    currentTheme,
    changeColorTheme,
    getAvailableThemes,
    getPalette,
    colorPalettes
  };
};

export default useColorTheme;