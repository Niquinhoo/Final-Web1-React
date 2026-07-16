import React, { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import './ImageZoomModal.css';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

export default function ImageZoomModal({ isOpen, onClose, src, alt }: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef({ x: 0, y: 0 });

  const resetPosition = useCallback(() => {
    positionRef.current = { x: 0, y: 0 };
    setPosition(positionRef.current);
    x.set(0);
    y.set(0);
  }, [x, y]);

  // Reset zoom and positions when opening or closing
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      resetPosition();
      setIsDragging(false);
    }
  }, [isOpen, resetPosition]);

  // Handle keyboard events (Escape key to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent page scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) resetPosition();
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    resetPosition();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.15;
    if (e.deltaY < 0) {
      // Zoom In
      setScale((prev) => Math.min(prev + zoomFactor, 4));
    } else {
      // Zoom Out
      setScale((prev) => {
        const next = Math.max(prev - zoomFactor, 1);
        if (next === 1) resetPosition();
        return next;
      });
    }
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      resetPosition();
    } else {
      setScale(2.5);
    }
  };

  // Pointer dragging events for pan
  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1 || !containerRef.current || !imgRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();
    boundsRef.current = {
      x: Math.max(0, (imgRect.width - containerRect.width) / 2),
      y: Math.max(0, (imgRect.height - containerRect.height) / 2),
    };
    dragStartRef.current = { x: e.clientX - x.get(), y: e.clientY - y.get() };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || scale <= 1) return;
    const next = {
      x: Math.max(-boundsRef.current.x, Math.min(boundsRef.current.x, e.clientX - dragStartRef.current.x)),
      y: Math.max(-boundsRef.current.y, Math.min(boundsRef.current.y, e.clientY - dragStartRef.current.y)),
    };
    positionRef.current = next;
    x.set(next.x);
    y.set(next.y);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      setPosition(positionRef.current);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="image-zoom-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {/* Header */}
          <div className="zoom-modal-header">
            <span className="zoom-modal-title">{alt}</span>
            <button className="zoom-modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
              <X size={24} />
            </button>
          </div>

          {/* Body / Image container */}
          <div
            ref={containerRef}
            className="zoom-modal-body"
            onWheel={handleWheel}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
          >
            <motion.div
              className="zoom-image-wrapper"
              style={{
                x,
                y,
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
              }}
              animate={{
                scale: scale,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <img
                ref={imgRef}
                src={src}
                alt={alt}
                decoding="async"
                draggable="false"
                onDoubleClick={handleDoubleClick}
                className="zoom-image-content"
              />
            </motion.div>
          </div>

          {/* Floating Controls */}
          <div className="zoom-modal-controls">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="control-btn"
              title="Alejar"
            >
              <ZoomOut size={18} />
            </button>
            <span className="zoom-level-indicator">{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className="control-btn"
              title="Acercar"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={handleReset}
              disabled={scale === 1 && position.x === 0 && position.y === 0}
              className="control-btn"
              title="Restablecer"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="zoom-modal-instructions">
            <span>Usa la rueda del mouse para hacer zoom · Doble click para ampliar · Arrastra para panear</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
