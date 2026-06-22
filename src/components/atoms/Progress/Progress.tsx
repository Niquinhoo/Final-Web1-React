import './Progress.css';

export interface CircularProgressProps {
  /** Diameter in px. */
  size?: number;
  /** Stroke thickness in px. */
  thickness?: number;
  /** 0..1 — when provided, renders a determinate indicator. */
  value?: number;
  className?: string;
}

/** MD3 Circular Progress Indicator. */
export function CircularProgress({
  size = 36,
  thickness = 4,
  value,
  className,
}: CircularProgressProps) {
  const determinate = typeof value === 'number';
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = determinate ? circumference * Math.max(0, Math.min(1, value!)) : circumference * 0.25;

  return (
    <div
      className={`md3-circular-progress ${determinate ? 'is-determinate' : 'is-indeterminate'} ${className ?? ''}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={determinate ? Math.round(value! * 100) : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="md3-circular-progress__track"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          className="md3-circular-progress__bar"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
    </div>
  );
}

export interface LinearProgressProps {
  /** 0..1 — when provided, renders a determinate indicator. */
  value?: number;
  className?: string;
}

/** MD3 Linear Progress Indicator. */
export function LinearProgress({ value, className }: LinearProgressProps) {
  const determinate = typeof value === 'number';
  return (
    <div
      className={`md3-linear-progress ${determinate ? 'is-determinate' : 'is-indeterminate'} ${className ?? ''}`}
      role="progressbar"
      aria-valuenow={determinate ? Math.round(value * 100) : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="md3-linear-progress__bar"
        style={determinate ? { width: `${Math.max(0, Math.min(1, value)) * 100}%` } : undefined}
      />
    </div>
  );
}
