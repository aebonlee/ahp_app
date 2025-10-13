/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Luxury Gray + Gold Accent 디자인 시스템
      colors: {
        // Luxury Brand Grays (12-step scale centered on #848484)
        gray: {
          0:   '#fafafa',
          50:  '#f5f5f5',
          100: '#eeeeee',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#bfbfbf',
          500: '#a3a3a3',
          600: '#919191',
          650: '#848484', // Core brand color
          700: '#6f6f6f',
          800: '#4d4d4d',
          900: '#1f1f1f',
        },
        // Luxury Accent Colors
        gold: {
          primary: '#C8A968',   // Main gold
          secondary: '#A98C4B', // Darker gold for hover states
          ivory: '#F4F1EA',     // Ivory accent
        },
        // Refined Semantic Colors (low saturation)
        info: '#6B8AA6',
        success: '#5F8D6A',
        warning: '#C49A4A',
        danger: '#A65A5A',
        // AHP-specific Chart Colors
        chart: {
          1: '#D4AF37', // gold
          2: '#6F737A', // neutral steel
          3: '#8F9AA6', // cool gray
          4: '#B8C2CC', // light steel
          5: '#E5E7EB', // extra light
        }
      },
      // Typography System
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'pretendard': ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      // Layout System
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1200px', // Main content container
          '2xl': '1200px',
        },
      },
      spacing: {
        '18': '4.5rem',   // 72px - Header height
        '280': '17.5rem', // 280px - Sidebar width
      },
      // Sophisticated Shadows
      boxShadow: {
        'luxury-sm': '0 2px 10px rgba(0,0,0,.06)',
        'luxury-md': '0 6px 24px rgba(0,0,0,.08)',
        'luxury-lg': '0 12px 40px rgba(0,0,0,.10)',
        'luxury-xl': '0 20px 60px rgba(0,0,0,.12)',
        'luxury-gold': '0 4px 20px rgba(200,169,104,.25)',
        'luxury-inner': 'inset 0 2px 4px rgba(0,0,0,.05)',
      },
      // Refined Border Radius (12px system)
      borderRadius: {
        'xs': '6px',
        'sm': '8px',
        'md': '12px', // Primary radius
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      // Luxury Gradients
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C8A968 0%, #A98C4B 100%)',
        'gradient-gray-subtle': 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
        'gradient-luxury': 'linear-gradient(135deg, #C8A968 0%, #848484 50%, #6f6f6f 100%)',
        'gradient-surface': 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
      },
      // Animation & Transitions
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Refined Spacing Scale
      space: {
        '0.5': '0.125rem', // 2px
        '1.5': '0.375rem', // 6px
        '2.5': '0.625rem', // 10px
        '3.5': '0.875rem', // 14px
        '4.5': '1.125rem', // 18px
        '5.5': '1.375rem', // 22px
        '6.5': '1.625rem', // 26px
        '7.5': '1.875rem', // 30px
      }
    },
  },
  plugins: [
    // Custom utility plugin for design system
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-luxury-primary': {
          color: theme('colors.gold.primary'),
        },
        '.text-luxury-secondary': {
          color: theme('colors.gray.650'),
        },
        '.bg-luxury-surface': {
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(var(--ahp-surface-elevated), var(--ahp-surface-elevated))',
        },
        '.border-luxury': {
          borderColor: theme('colors.gray.200'),
        },
        '.shadow-luxury': {
          boxShadow: theme('boxShadow.luxury-md'),
        },
        '.transition-luxury': {
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      }
      addUtilities(newUtilities)
    }
  ],
}