import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'muninn-theme';
const DEFAULT_THEME: Theme = 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (e) {
      console.error('Failed to read theme from localStorage:', e);
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return { theme, setTheme: setThemeState, toggleTheme };
}