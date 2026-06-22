import { useRipple } from '../../_md3/hooks';
import './SegmentedButton.css';

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: string;
}

export interface SegmentedButtonProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  /** Allow multiple selections (filter-style). */
  multiSelect?: boolean;
  className?: string;
}

/**
 * MD3 Segmented Button. Single-select by default; multiSelect for filter groups.
 */
export default function SegmentedButton({
  options,
  value,
  onChange,
  multiSelect = false,
  className,
}: SegmentedButtonProps) {
  const selectedValues = multiSelect ? (Array.isArray(value) ? value : [value]) : [value];

  return (
    <div className={`md3-segmented-button ${className ?? ''}`} role="group">
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(option.value);
        return (
          <Segment
            key={option.value}
            option={option}
            isSelected={isSelected}
            isFirst={index === 0}
            isLast={index === options.length - 1}
            onClick={() => {
              if (multiSelect) {
                const next = isSelected
                  ? selectedValues.filter(v => v !== option.value)
                  : [...selectedValues, option.value];
                onChange(next.join(','));
              } else {
                onChange(option.value);
              }
            }}
          />
        );
      })}
    </div>
  );
}

function Segment({
  option,
  isSelected,
  isFirst,
  isLast,
  onClick,
}: {
  option: SegmentedOption;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick: () => void;
}) {
  const { ripples, createRipple } = useRipple();

  return (
    <button
      type="button"
      className={`md3-segmented-button__segment ${isSelected ? 'is-selected' : ''} ${isFirst ? 'is-first' : ''} ${isLast ? 'is-last' : ''}`}
      onClick={onClick}
      onPointerDown={createRipple}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <span className="material-symbols-outlined md3-segmented-button__check" aria-hidden="true">
          check
        </span>
      )}
      {option.icon && !isSelected && (
        <span className="material-symbols-outlined md3-segmented-button__icon" aria-hidden="true">
          {option.icon}
        </span>
      )}
      <span className="md3-segmented-button__label">{option.label}</span>
      {ripples.map(r => (
        <span
          key={r.id}
          className="md3-ripple"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </button>
  );
}
