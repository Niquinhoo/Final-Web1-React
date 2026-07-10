import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './DotCursor.css';

interface DotCursorProps {
  dotSize?: number;
  hoverScale?: number;
  targetSelector?: string;
}

function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  const hasTouch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 1024;
  return hasTouch || isSmallScreen;
}

export default function DotCursor({
  dotSize = 8,
  hoverScale = 2.5,
  targetSelector = "a, button, input, textarea, select, [role='button'], .cursor-target",
}: DotCursorProps) {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useMemo(() => isTouchDevice(), []);

  useEffect(() => {
    if (isMobile) return;

    // Save current body cursor style
    const originalCursor = document.body.style.cursor;
    
    // Add class to hide default cursor globally
    document.body.classList.add('custom-cursor-active');

    const moveCursor = (e: MouseEvent) => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08,
        ease: 'power2.out',
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest(targetSelector)) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest(targetSelector)) {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      document.body.style.cursor = originalCursor;
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isMobile, targetSelector]);

  useEffect(() => {
    if (isMobile || !dotRef.current) return;
    gsap.to(dotRef.current, {
      scale: isHovering ? hoverScale : 1,
      duration: 0.2,
      ease: 'power2.out',
    });
  }, [isMobile, isHovering, hoverScale]);

  if (isMobile) return null;

  return (
    <div
      ref={dotRef}
      className={`dot-cursor${isHovering ? ' is-hovering' : ''}`}
      style={{
        width: `${dotSize}px`,
        height: `${dotSize}px`,
      }}
    />
  );
}
