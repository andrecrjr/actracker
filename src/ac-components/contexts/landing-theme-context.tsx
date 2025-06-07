import { useTheme } from '@/ac-components/hooks/use-theme';
import React, { createContext, useContext, useEffect } from 'react';

interface LandingThemeContextType {
  isDark: boolean;
  toggleMode: () => void;
}

const LandingThemeContext = createContext<LandingThemeContextType | undefined>(
  undefined,
);

interface LandingThemeProviderProps {
  children: React.ReactNode;
}

export function LandingThemeProvider({ children }: LandingThemeProviderProps) {
  const { mode, toggleMode } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;

    // Force neutral gray color for landing page
    root.style.setProperty(
      '--primary',
      mode === 'light' ? '240 5.9% 10%' : '0 0% 98%',
    );
    root.style.setProperty(
      '--primary-foreground',
      mode === 'light' ? '0 0% 98%' : '240 5.9% 10%',
    );

    // Override other colors to maintain the minimalist theme
    root.style.setProperty(
      '--neutral-gray',
      mode === 'light' ? '240 5.9% 10%' : '0 0% 98%',
    );
    root.style.setProperty(
      '--warm-gray',
      mode === 'light' ? '240 3.8% 46.1%' : '240 5% 64.9%',
    );

    // Cleanup function to restore user's theme when leaving landing page
    return () => {
      // This will be handled by the main theme hook when component unmounts
    };
  }, [mode]);

  return (
    <LandingThemeContext.Provider
      value={{ isDark: mode === 'dark', toggleMode }}
    >
      {children}
    </LandingThemeContext.Provider>
  );
}

export function useLandingTheme() {
  const context = useContext(LandingThemeContext);
  if (context === undefined) {
    throw new Error(
      'useLandingTheme must be used within a LandingThemeProvider',
    );
  }
  return context;
}

export default LandingThemeProvider;
