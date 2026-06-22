import './Card.css';

export type CardVariant = 'outlined' | 'elevated' | 'filled';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Remove default padding (useful when wrapping tables/lists). */
  noPadding?: boolean;
  /** Add a hover lift + border highlight (stat-card behaviour). */
  interactive?: boolean;
}

const VARIANT_CLASS: Record<CardVariant, string> = {
  outlined: '',
  elevated: 'elevated',
  filled: 'filled',
};

/**
 * MD3 Card container. Outlined by default, with elevated/filled variants.
 */
export default function Card({
  variant = 'outlined',
  noPadding = false,
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  const classes = [
    'card',
    VARIANT_CLASS[variant],
    noPadding ? 'p-0' : '',
    interactive ? 'md3-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
