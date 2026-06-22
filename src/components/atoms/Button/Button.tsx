import { forwardRef } from 'react';
import { useRipple } from '../../_md3/hooks';
import Icon from '../Icon/Icon';
import './Button.css';

export type ButtonVariant =
  | 'filled'
  | 'tonal'
  | 'outlined'
  | 'text'
  | 'elevated'
  | 'danger';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Material Symbols icon name shown before the label. */
  icon?: string;
  /** Icon shown after the label (e.g. dropdown chevrons). */
  trailingIcon?: string;
  /** Render full width. */
  fullWidth?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  filled: 'md3-btn-filled',
  tonal: 'md3-btn-tonal',
  outlined: 'md3-btn-outlined',
  text: 'md3-btn-text',
  elevated: 'md3-btn-elevated',
  danger: 'md3-btn-danger',
};

/**
 * MD3 Button with ripple + state layer.
 *
 * Visuals come from the shared `.md3-btn` classes in md3-components.css; this
 * component adds the ripple behaviour on top.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'filled',
    size = 'md',
    icon,
    trailingIcon,
    fullWidth = false,
    className,
    children,
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

  const classes = [
    'md3-btn',
    VARIANT_CLASS[variant],
    size === 'sm' ? 'btn-sm' : '',
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={18} />}
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

export default Button;
