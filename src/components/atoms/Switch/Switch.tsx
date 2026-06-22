import { useRipple } from '../../_md3/hooks';
import './Switch.css';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  /** Material Symbols icon shown in the thumb when selected. */
  selectedIcon?: string;
  /** Material Symbols icon shown in the thumb when unselected. */
  unselectedIcon?: string;
  id?: string;
}

/**
 * MD3 Switch. The thumb expands to a pill when selected and shows an optional
 * leading/trailing icon.
 */
export default function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  selectedIcon,
  unselectedIcon,
  id,
}: SwitchProps) {
  const { ripples, createRipple } = useRipple();

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!disabled) createRipple(e);
  };

  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`md3-switch ${checked ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
      onClick={() => onChange(!checked)}
      onPointerDown={handlePointerDown}
    >
      <span className="md3-switch__track">
        <span className="md3-switch__thumb">
          {checked && selectedIcon && (
            <span className="material-symbols-outlined md3-switch__icon">{selectedIcon}</span>
          )}
          {!checked && unselectedIcon && (
            <span className="material-symbols-outlined md3-switch__icon">{unselectedIcon}</span>
          )}
        </span>
      </span>
      {ripples.map(r => (
        <span
          key={r.id}
          className="md3-switch__ripple"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </button>
  );
}
