import { useCallback, useState } from 'react';

/**
 * A single ripple instance spawned from a pointer event.
 * `id` is used as React key; x/y are the center coordinates relative to the
 * element, and `size` is the diameter (max of width/height) of the ripple.
 */
export interface RippleInstance {
  id: number;
  x: number;
  y: number;
  size: number;
}

export interface UseRippleResult {
  /** Active ripple elements to render inside the target. */
  ripples: RippleInstance[];
  /** Attach to the host element's onPointerDown to spawn a ripple. */
  createRipple: (event: React.PointerEvent<HTMLElement>) => void;
}

let rippleCounter = 0;

/**
 * MD3 ripple effect hook.
 *
 * Usage:
 *   const { ripples, createRipple } = useRipple();
 *   <button onPointerDown={createRipple} ref={containerRef}>
 *     {ripples.map(r => <span key={r.id} className="md3-ripple" style={...} />)}
 *   </button>
 *
 * The host element must be `position: relative; overflow: hidden;`.
 */
export function useRipple(): UseRippleResult {
  const [ripples, setRipples] = useState<RippleInstance[]>([]);

  const createRipple = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const id = ++rippleCounter;
    const instance: RippleInstance = { id, x, y, size };

    setRipples(prev => [...prev, instance]);

    // Remove the ripple once the animation completes.
    window.setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  }, []);

  return { ripples, createRipple };
}
