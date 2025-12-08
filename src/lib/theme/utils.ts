import { themeConfig } from './constants';

export const getThemeColor = (path: string): string => {
  return path.split('.').reduce((obj: any, key) => obj[key], themeConfig.colors as any);
};

export const getThemeValue = <T>(path: string): T => {
  return path.split('.').reduce((obj: any, key) => obj[key], themeConfig as any);
};

export const createThemeVariables = () => {
  const colors = themeConfig.colors;
  const variables: Record<string, string> = {};

  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      variables[`--color-${key}`] = value;
    } else {
      Object.entries(value).forEach(([shade, color]) => {
        variables[`--color-${key}-${shade}`] = color;
      });
    }
  });

  return variables;
};

export const generateTailwindConfig = () => {
  return {
    theme: {
      extend: {
        colors: themeConfig.colors,
        spacing: themeConfig.spacing,
        fontFamily: themeConfig.typography.fontFamily,
        fontSize: themeConfig.typography.fontSize,
        boxShadow: themeConfig.shadows,
        zIndex: themeConfig.zIndex,
        animation: themeConfig.animation
      }
    }
  };
};
