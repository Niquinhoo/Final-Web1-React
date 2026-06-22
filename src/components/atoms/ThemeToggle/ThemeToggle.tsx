import { useTheme } from '../../_md3/hooks';
import './ThemeToggle.css';

export interface ThemeToggleProps {
  className?: string;
}

/**
 * MD3 dark/light theme toggle button.
 * Uses the sun/moon Material Symbols for a compact, icon-only control.
 */
export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const icon = theme === 'dark' ? 'light_mode' : 'dark_mode';

  return (
    <button
      type="button"
      className={`md3-theme-toggle ${className ?? ''}`}
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}
