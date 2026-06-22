import { forwardRef } from 'react';
import { useRipple } from '../../_md3/hooks';
import './IconButton.css';

export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  /** Material Symbols icon name. */
  icon: string;
  /** Accessible label (required for icon-only buttons). */
  label: string;
  /** Toggle to the filled icon state. */
  filled?: boolean;
  /** Override the default 24px optical size. */
  size?: number;
}

const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  standard: '',
  filled: 'filled',
  tonal: 'tonal',
  outlined: 'outlined',
};

/**
 * MD3 IconButton. 40x40 circular surface with state layer + ripple.
 */
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    variant = 'standard',
    icon,
    label,
    filled = false,
    size = 24,
    className,
    onPointerDown,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  const { ripples, createRipple } = useRipple();

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!disabled) createRipple(event);
    onPointerDown?.(event);
  };

  const classes = ['md3-icon-btn', VARIANT_CLASS[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled}
      aria-label={label}
      title={label}
      onPointerDown={handlePointerDown}
      {...rest}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        }}
      >
        {icon}
      </span>
      {ripples.map(r => (
        <span
          key={r.id}
          className="md3-ripple"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </button>
  );
});

export default IconButton;
