import { useCallback, useSyncExternalStore } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'md3-theme';
const listeners = new Set<() => void>();
let mediaListening = false;

function resolveTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

let currentTheme = resolveTheme();

function applyTheme(theme: ThemeMode) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (!mediaListening) {
    mediaListening = true;
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== 'light' && stored !== 'dark') applyTheme(event.matches ? 'dark' : 'light');
    });
  }

  return () => listeners.delete(listener);
}

if (typeof document !== 'undefined') applyTheme(currentTheme);

export interface UseThemeResult {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export function useTheme(): UseThemeResult {
  const theme = useSyncExternalStore(subscribe, () => currentTheme, (): ThemeMode => 'light');

  const setTheme = useCallback((mode: ThemeMode) => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    const switchTheme = () => {
      const next = currentTheme === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
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
