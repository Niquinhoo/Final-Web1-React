import { motion } from 'framer-motion';

interface GridMotionProps {
  items: string[];
  gradientColor?: string;
}

export default function GridMotion({ items, gradientColor = '#000000' }: GridMotionProps) {
  // Ensure we have enough items to fill the expanded grid
  const tiles = [...items, ...items, ...items.slice(0, 10)];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: gradientColor,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        animate={{ y: [0, -60, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(90px, 1fr))',
          gap: 16,
          width: '140%',
          minHeight: '140%',
          transform: 'rotate(-15deg) translate(-10%, -15%) scale(0.8)',
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        {tiles.map((src, index) => (
          <img
            key={`${src}-${index}`}
            src={src}
            alt=""
            loading="lazy"
            draggable={false}
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              borderRadius: 14,
              opacity: 0.85,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
