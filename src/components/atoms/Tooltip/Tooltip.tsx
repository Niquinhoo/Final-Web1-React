import { cloneElement, isValidElement, useState, type ReactElement } from 'react';
import './Tooltip.css';

export interface TooltipProps {
  text: string;
  children: ReactElement;
  /** Show delay in ms. */
  delay?: number;
}

/**
 * MD3 Tooltip. Wraps a single element and reveals a plain tooltip on hover/focus.
 */
export default function Tooltip({ text, children, delay = 400 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const show = () => {
    timer = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timer) clearTimeout(timer);
    setVisible(false);
  };

  const childProps = {
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  };

  const enhancedChild = isValidElement(children)
    ? cloneElement(children, childProps as Partial<typeof children>)
    : children;

  return (
    <span className="md3-tooltip-wrapper">
      {enhancedChild}
      {visible && (
        <span className="md3-tooltip" role="tooltip">
          {text}
        </span>
      )}
    </span>
  );
}
