import type { CSSProperties, FC } from 'react';

import './CircularText.css';

interface CircularTextProps {
  text: string;
  spinDuration?: number;
  onHover?: 'slowDown' | 'speedUp' | 'pause' | 'goBonkers' | string;
  className?: string;
}

const CircularText: FC<CircularTextProps> = ({ text, spinDuration = 20, onHover = 'speedUp', className = '' }) => {
  const letters = Array.from(text);

  return (
    <div
      className={`circular-text circular-text--${onHover} ${className}`}
      style={{
        '--spin-duration': `${spinDuration}s`,
        '--spin-slow': `${spinDuration * 2}s`,
        '--spin-fast': `${spinDuration / 4}s`,
        '--spin-bonkers': `${spinDuration / 20}s`,
      } as CSSProperties}
    >
      {letters.map((letter, i) => {
        const rotationDeg = (360 / letters.length) * i;
        const factor = Math.PI / letters.length;
        const x = factor * i;
        const y = factor * i;
        const transform = `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`;

        return (
          <span key={i} style={{ transform, WebkitTransform: transform }}>
            {letter}
          </span>
        );
      })}
    </div>
  );
};

export default CircularText;
