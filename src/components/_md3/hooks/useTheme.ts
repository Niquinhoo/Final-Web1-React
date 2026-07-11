import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'md3-theme';

function resolveInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export interface UseThemeResult {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

/**
 * MD3 theme manager.
 *
 * Persists the explicit choice in localStorage and reflects it on
 * <html data-theme="...">. When the user has not chosen, the OS preference is
 * followed via prefers-color-scheme (the fallback in index.css covers paint
 * before this hook runs).
 */
export function useTheme(): UseThemeResult {
  const [theme, setThemeState] = useState<ThemeMode>(resolveInitialTheme);

  // Reflect the theme on the document element.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Keep in sync if the OS preference changes AND the user never chose.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== 'light' && stored !== 'dark') {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    const switchTheme = () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute('data-theme', next);
      document.documentElement.style.colorScheme = next;
      setThemeState(next);
    };

    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      switchTheme();
      return;
    }

    document.documentElement.classList.add('theme-transitioning');
    document.startViewTransition(switchTheme).finished.finally(() => {
      document.documentElement.classList.remove('theme-transitioning');
    });
  }, []);

  return { theme, toggleTheme, setTheme };
}
