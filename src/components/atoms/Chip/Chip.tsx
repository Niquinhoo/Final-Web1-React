import { useRipple } from '../../_md3/hooks';
import './Chip.css';

export type ChipVariant = 'assist' | 'filter' | 'input' | 'suggestion';
export type ChipColor = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface ChipProps {
  variant?: ChipVariant;
  color?: ChipColor;
  label: string;
  /** Material Symbols icon name shown before the label. */
  icon?: string;
  /** Material Symbols icon for filter checkmark / dismiss. */
  trailingIcon?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const COLOR_CLASS: Record<ChipColor, string> = {
  neutral: 'md3-chip--neutral',
  primary: 'md3-chip--primary',
  success: 'md3-chip--success',
  warning: 'md3-chip--warning',
  danger: 'md3-chip--danger',
};

/**
 * MD3 Assist / Filter / Input / Suggestion Chip.
 * Used as a non-interactive status badge by omitting onClick.
 */
export default function Chip({
  variant = 'assist',
  color = 'neutral',
  label,
  icon,
  trailingIcon,
  selected = false,
  disabled = false,
  onClick,
  className,
}: ChipProps) {
  const { ripples, createRipple } = useRipple();
  const interactive = Boolean(onClick) && !disabled;

  const classes = [
    'md3-chip',
    COLOR_CLASS[color],
    variant === 'filter' ? 'md3-chip--filter' : '',
    selected ? 'is-selected' : '',
    interactive ? 'is-interactive' : '',
    disabled ? 'is-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handlePointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (interactive) createRipple(e);
  };

  return (
    <span
      className={classes}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onPointerDown={handlePointerDown}
      aria-disabled={disabled || undefined}
    >
      {variant === 'filter' && selected && (
        <span className="material-symbols-outlined md3-chip__check" aria-hidden="true">
          check
        </span>
      )}
      {icon && (
        <span className="material-symbols-outlined md3-chip__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="md3-chip__label">{label}</span>
      {trailingIcon && (
        <span className="material-symbols-outlined md3-chip__icon" aria-hidden="true">
          {trailingIcon}
        </span>
      )}
      {ripples.map(r => (
        <span
          key={r.id}
          className="md3-ripple"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </span>
  );
}
