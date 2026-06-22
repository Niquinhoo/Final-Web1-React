import './Icon.css';

export interface IconProps {
  /** Material Symbols Outlined ligature name, e.g. "home", "delete". */
  name: string;
  /** Fill the icon (filled vs outlined). */
  filled?: boolean;
  /** Optical weight 100..700. */
  weight?: number;
  /** Optical size in px (20..48). */
  size?: number;
  /** Grade (-25..200). */
  grade?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MD3 Material Symbols icon wrapper.
 * Centralises the font-variation-settings so every icon is consistent.
 */
export default function Icon({
  name,
  filled = false,
  weight = 400,
  size = 24,
  grade = 0,
  className,
  style,
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined md3-icon ${className ?? ''}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${size}`,
        fontSize: `${size}px`,
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
