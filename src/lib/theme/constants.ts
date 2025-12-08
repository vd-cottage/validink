export const themeConfig = {
  colors: {
    primary: {
      DEFAULT: '#ff4b6e',
      light: '#ffe4e9',
      dark: '#d93d5c',
      100: '#fff1f3',
      200: '#ffe4e9',
      300: '#ffd1db',
      400: '#ff9eb1',
      500: '#ff4b6e',
      600: '#d93d5c',
      700: '#b32f4a',
      800: '#8c2138',
      900: '#661326'
    },
    success: {
      DEFAULT: '#22c55e',
      light: '#dcfce7',
      dark: '#16a34a',
      100: '#f0fdf4',
      200: '#dcfce7',
      300: '#bbf7d0',
      400: '#86efac',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6'
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      tertiary: '#9ca3af'
    },
    border: {
      DEFAULT: '#e5e7eb',
      focus: '#ff4b6e'
    }
  },
  spacing: {
    container: {
      padding: '2rem',
      maxWidth: '1280px'
    },
    header: {
      height: '4rem'
    },
    sidebar: {
      width: '16rem'
    }
  },
  typography: {
    fontFamily: {
      sans: ['var(--font-inter)'],
      mono: ['var(--font-mono)']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  },
  animation: {
    DEFAULT: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)'
  },
  zIndex: {
    navbar: 100,
    sidebar: 50,
    modal: 1000,
    toast: 2000
  }
} as const;

