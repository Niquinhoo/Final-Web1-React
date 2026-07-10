import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Cubes.css';

interface CubeDuration {
  enter: number;
  leave: number;
}

interface CubesProps {
  gridSize?: number;
  cubeSize?: number;
  maxAngle?: number;
  radius?: number;
  easing?: string;
  duration?: CubeDuration;
  cellGap?: number | { row?: number; col?: number };
  borderStyle?: string;
  faceColor?: string;
  shadow?: boolean | string;
  autoAnimate?: boolean;
  rippleOnClick?: boolean;
  rippleColor?: string;
  rippleSpeed?: number;
}

const Cubes = ({
  gridSize = 10,
  cubeSize,
  maxAngle = 45,
  radius = 3,
  easing = 'power3.out',
  duration = { enter: 0.3, leave: 0.6 },
  cellGap,
  borderStyle = '1px solid #fff',
  faceColor = '#120F17',
  shadow = false,
  autoAnimate = true,
  rippleOnClick = true,
  rippleColor = '#fff',
  rippleSpeed = 2,
}: CubesProps) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const userActiveRef = useRef(false);
  const simPosRef = useRef({ x: 0, y: 0 });
  const simTargetRef = useRef({ x: 0, y: 0 });
  const simRAFRef = useRef<number | null>(null);

  const colGap = typeof cellGap === 'number' ? `${cellGap}px` : cellGap?.col !== undefined ? `${cellGap.col}px` : '5%';
  const rowGap = typeof cellGap === 'number' ? `${cellGap}px` : cellGap?.row !== undefined ? `${cellGap.row}px` : '5%';

  const tiltAt = useCallback(
    (rowCenter: number, colCenter: number) => {
      if (!sceneRef.current) return;

      // ponytail: the login grid stays small, so a direct scan is simpler than a spatial index.
      sceneRef.current.querySelectorAll<HTMLElement>('.cube').forEach((cube) => {
        const row = Number(cube.dataset.row);
        const col = Number(cube.dataset.col);
        const distance = Math.hypot(row - rowCenter, col - colCenter);

        if (distance <= radius) {
          const angle = (1 - distance / radius) * maxAngle;
          gsap.to(cube, {
            duration: duration.enter,
            ease: easing,
            overwrite: true,
            rotateX: -angle,
            rotateY: angle,
          });
        } else {
          gsap.to(cube, {
            duration: duration.leave,
            ease: 'power3.out',
            overwrite: true,
            rotateX: 0,
            rotateY: 0,
          });
        }
      });
    },
    [duration.enter, duration.leave, easing, maxAngle, radius],
  );

  const markUserActive = useCallback(() => {
    userActiveRef.current = true;
    if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      userActiveRef.current = false;
    }, 3000);
  }, []);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const scene = sceneRef.current;
      if (!scene) return;

      markUserActive();
      const rect = scene.getBoundingClientRect();
      const cellWidth = rect.width / gridSize;
      const cellHeight = rect.height / gridSize;
      const colCenter = (event.clientX - rect.left) / cellWidth;
      const rowCenter = (event.clientY - rect.top) / cellHeight;

      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
    },
    [gridSize, markUserActive, tiltAt],
  );

  const resetAll = useCallback(() => {
    if (!sceneRef.current) return;

    sceneRef.current.querySelectorAll<HTMLElement>('.cube').forEach((cube) => {
      gsap.to(cube, {
        duration: duration.leave,
        rotateX: 0,
        rotateY: 0,
        ease: 'power3.out',
      });
    });
  }, [duration.leave]);

  const onTouchMove = useCallback(
    (event: TouchEvent) => {
      event.preventDefault();
      const scene = sceneRef.current;
      const touch = event.touches[0];
      if (!scene || !touch) return;

      markUserActive();
      const rect = scene.getBoundingClientRect();
      const cellWidth = rect.width / gridSize;
      const cellHeight = rect.height / gridSize;
      const colCenter = (touch.clientX - rect.left) / cellWidth;
      const rowCenter = (touch.clientY - rect.top) / cellHeight;

      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
    },
    [gridSize, markUserActive, tiltAt],
  );

  const onClick = useCallback(
    (event: MouseEvent) => {
      const scene = sceneRef.current;
      if (!rippleOnClick || !scene) return;

      const rect = scene.getBoundingClientRect();
      const cellWidth = rect.width / gridSize;
      const cellHeight = rect.height / gridSize;
      const colHit = Math.floor((event.clientX - rect.left) / cellWidth);
      const rowHit = Math.floor((event.clientY - rect.top) / cellHeight);
      const spreadDelay = 0.15 / rippleSpeed;
      const animationDuration = 0.3 / rippleSpeed;
      const holdTime = 0.6 / rippleSpeed;
      const rings: Record<number, HTMLElement[]> = {};

      scene.querySelectorAll<HTMLElement>('.cube').forEach((cube) => {
        const row = Number(cube.dataset.row);
        const col = Number(cube.dataset.col);
        const ring = Math.round(Math.hypot(row - rowHit, col - colHit));
        (rings[ring] ??= []).push(cube);
      });

      Object.keys(rings)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((ring) => {
          const delay = ring * spreadDelay;
          const faces = rings[ring].flatMap((cube) => Array.from(cube.querySelectorAll<HTMLElement>('.cube-face')));

          gsap.to(faces, {
            backgroundColor: rippleColor,
            duration: animationDuration,
            delay,
            ease: 'power3.out',
          });
          gsap.to(faces, {
            backgroundColor: faceColor,
            duration: animationDuration,
            delay: delay + animationDuration + holdTime,
            ease: 'power3.out',
          });
        });
    },
    [faceColor, gridSize, rippleColor, rippleOnClick, rippleSpeed],
  );

  useEffect(() => {
    if (!autoAnimate || !sceneRef.current) return;

    simPosRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };
    simTargetRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };

    const loop = () => {
      if (!userActiveRef.current) {
        const position = simPosRef.current;
        const target = simTargetRef.current;
        position.x += (target.x - position.x) * 0.02;
        position.y += (target.y - position.y) * 0.02;
        tiltAt(position.y, position.x);

        if (Math.hypot(position.x - target.x, position.y - target.y) < 0.1) {
          simTargetRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };
        }
      }

      simRAFRef.current = requestAnimationFrame(loop);
    };

    simRAFRef.current = requestAnimationFrame(loop);
    return () => {
      if (simRAFRef.current !== null) cancelAnimationFrame(simRAFRef.current);
    };
  }, [autoAnimate, gridSize, tiltAt]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    scene.addEventListener('pointermove', onPointerMove);
    scene.addEventListener('pointerleave', resetAll);
    scene.addEventListener('click', onClick);
    scene.addEventListener('touchmove', onTouchMove, { passive: false });
    scene.addEventListener('touchend', resetAll);

    return () => {
      scene.removeEventListener('pointermove', onPointerMove);
      scene.removeEventListener('pointerleave', resetAll);
      scene.removeEventListener('click', onClick);
      scene.removeEventListener('touchmove', onTouchMove);
      scene.removeEventListener('touchend', resetAll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
    };
  }, [onClick, onPointerMove, onTouchMove, resetAll]);

  const cells = Array.from({ length: gridSize });
  const sceneStyle = {
    gridTemplateColumns: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
    columnGap: colGap,
    rowGap,
  };
  const wrapperStyle = {
    '--cube-face-border': borderStyle,
    '--cube-face-bg': faceColor,
    '--cube-face-shadow': shadow === true ? '0 0 6px rgba(0,0,0,.5)' : shadow || 'none',
    ...(cubeSize ? { width: `${gridSize * cubeSize}px`, height: `${gridSize * cubeSize}px` } : {}),
  } as React.CSSProperties;

  return (
    <div className="default-animation" style={wrapperStyle} aria-hidden="true">
      <div ref={sceneRef} className="default-animation--scene" style={sceneStyle}>
        {cells.map((_, row) =>
          cells.map((__, col) => (
            <div key={`${row}-${col}`} className="cube" data-row={row} data-col={col}>
              <div className="cube-face cube-face--top" />
              <div className="cube-face cube-face--bottom" />
              <div className="cube-face cube-face--left" />
              <div className="cube-face cube-face--right" />
              <div className="cube-face cube-face--front" />
              <div className="cube-face cube-face--back" />
            </div>
          )),
        )}
      </div>
    </div>
  );
};

export default Cubes;
