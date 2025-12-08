import { useTheme as useNextTheme } from 'next-themes';
import { themeConfig } from './constants';

export const useTheme = () => {
  const { theme, setTheme } = useNextTheme();
  return {
    theme,
    setTheme,
    config: themeConfig
  };
};

export const useThemeValue = <T>(path: string): T => {
  return path.split('.').reduce((obj, key) => obj[key], themeConfig as any);
};

