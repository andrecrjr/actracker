import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export type ThemeColor =
  | 'black' // Default - black in light, white in dark
  | 'neutral-gray' // Minimalist gray option
  | 'emerald'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'cyan'
  | 'indigo'
  | 'slate';

export interface ThemeConfig {
  mode: Theme;
  color: ThemeColor;
}

const colorVariables: Record<ThemeColor, { light: string; dark: string }> = {
  black: {
    light: '0 0% 9%', // Almost black
    dark: '0 0% 98%', // Almost white
  },
  'neutral-gray': {
    light: '240 5.9% 10%',
    dark: '0 0% 98%',
  },
  emerald: {
    light: '160 84% 39%',
    dark: '160 84% 49%',
  },
  violet: {
    light: '262 83% 58%',
    dark: '262 83% 68%',
  },
  rose: {
    light: '330 81% 60%',
    dark: '330 81% 70%',
  },
  amber: {
    light: '43 96% 56%',
    dark: '43 96% 66%',
  },
  cyan: {
    light: '180 100% 50%',
    dark: '180 100% 60%',
  },
  indigo: {
    light: '239 84% 67%',
    dark: '239 84% 77%',
  },
  slate: {
    light: '215 25% 27%',
    dark: '215 25% 77%',
  },
};

export function useTheme() {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const storedMode = localStorage.getItem('theme-mode') as Theme;
      const storedColor = localStorage.getItem('theme-color') as ThemeColor;

      const mode =
        storedMode ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light');
      const color = storedColor || 'black';

      return { mode, color };
    }
    return { mode: 'light', color: 'black' };
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove('light', 'dark');

    // Add current theme class
    root.classList.add(config.mode);

    // Update CSS custom properties for the selected color
    const colorVars = colorVariables[config.color];
    root.style.setProperty('--primary', colorVars[config.mode]);
    root.style.setProperty(
      '--primary-foreground',
      config.mode === 'light' ? '0 0% 98%' : '0 0% 9%',
    );

    // Store in localStorage
    localStorage.setItem('theme-mode', config.mode);
    localStorage.setItem('theme-color', config.color);
  }, [config]);

  const toggleMode = () => {
    setConfig(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
    }));
  };

  const setColor = (color: ThemeColor) => {
    setConfig(prev => ({ ...prev, color }));
  };

  const setMode = (mode: Theme) => {
    setConfig(prev => ({ ...prev, mode }));
  };

  return {
    ...config,
    setConfig,
    setMode,
    setColor,
    toggleMode,
    isDark: config.mode === 'dark',
    // Legacy support for existing components
    theme: config.mode,
    setTheme: setMode,
    toggleTheme: toggleMode,
  };
}
