import React, { useRef, useCallback, useEffect } from 'react';
import './BorderGlow.css';

interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 160, s: 80, l: 50 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const vars: Record<string, string> = {};
  for (let i = 0; i < opacities.length; i++) {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
  }
  return vars;
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]) {
  const vars: Record<string, string> = {};
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

function easeOutCubic(x: number) { return 1 - Math.pow(1 - x, 3); }
function easeInCubic(x: number) { return x * x * x; }

function getEdgeProximity(width: number, height: number, x: number, y: number) {
  const dx = x - width / 2;
  const dy = y - height / 2;
  const kx = dx === 0 ? Infinity : width / 2 / Math.abs(dx);
  const ky = dy === 0 ? Infinity : height / 2 / Math.abs(dy);
  return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
}

function getCursorAngle(width: number, height: number, x: number, y: number) {
  const dx = x - width / 2;
  const dy = y - height / 2;
  if (dx === 0 && dy === 0) return 0;
  const degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  return degrees < 0 ? degrees + 360 : degrees;
}

interface AnimateProps {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (x: number) => number;
  onUpdate: (v: number) => void;
  onEnd?: () => void;
}

function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }: AnimateProps) {
  const t0 = performance.now() + delay;
  let frame = 0;
  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) frame = requestAnimationFrame(tick);
    else if (onEnd) onEnd();
  }
  const timer = window.setTimeout(() => { frame = requestAnimationFrame(tick); }, delay);
  return () => {
    window.clearTimeout(timer);
    cancelAnimationFrame(frame);
  };
}

const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '160 80 50',
  backgroundColor = '#1a1e1c',
  borderRadius = 12,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  colors = ['#3bb393', '#2a6053', '#c75d3a'],
  fillOpacity = 0.5,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  const updateRect = useCallback(() => {
    if (cardRef.current) rectRef.current = cardRef.current.getBoundingClientRect();
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    pointerRef.current = { x: e.clientX, y: e.clientY };
    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const rect = rectRef.current ?? card.getBoundingClientRect();
      const x = pointerRef.current.x - rect.left;
      const y = pointerRef.current.y - rect.top;
      card.style.setProperty('--edge-proximity', `${(getEdgeProximity(rect.width, rect.height, x, y) * 100).toFixed(3)}`);
      card.style.setProperty('--cursor-angle', `${getCursorAngle(rect.width, rect.height, x, y).toFixed(3)}deg`);
    });
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new ResizeObserver(updateRect);
    observer.observe(card);
    updateRect();
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [updateRect]);

  useEffect(() => {
    if (!animated || !cardRef.current) return;
    const card = cardRef.current;
    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', `${angleStart}deg`);

    const cleanups = [animateValue({ duration: 500, onUpdate: v => card.style.setProperty('--edge-proximity', `${v}`) }),
    animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: v => {
      card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
    }}),
    animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: v => {
      card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
    }}),
    animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
      onUpdate: v => card.style.setProperty('--edge-proximity', `${v}`),
      onEnd: () => card.classList.remove('sweep-active'),
    })];
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [animated]);

  const glowVars = buildGlowVars(glowColor, glowIntensity);

  return (
    <div
      ref={cardRef}
      onPointerEnter={updateRect}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`}
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        ...glowVars,
        ...buildGradientVars(colors),
      } as React.CSSProperties}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
