import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

interface StaggeredMenuProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function StaggeredMenu({ open, onClose, children }: StaggeredMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    const layers = root.querySelectorAll('.staggered-menu-layer');
    const revealItems = panel.querySelectorAll('.staggered-menu-reveal');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      gsap.killTweensOf([root, panel, layers, revealItems]);

      if (open) {
        gsap.set(root, { visibility: 'visible' });
        gsap.timeline({ defaults: { ease: 'power4.out' } })
          .to(root, { opacity: 1, duration: reduceMotion ? 0 : 0.2 }, 0)
          .fromTo(layers, { xPercent: -100 }, {
            xPercent: 0,
            duration: reduceMotion ? 0 : 0.48,
            stagger: reduceMotion ? 0 : 0.07,
          }, 0)
          .fromTo(panel, { xPercent: -100 }, {
            xPercent: 0,
            duration: reduceMotion ? 0 : 0.62,
          }, reduceMotion ? 0 : 0.12)
          .fromTo(revealItems, { yPercent: 115, rotate: 3 }, {
            yPercent: 0,
            rotate: 0,
            duration: reduceMotion ? 0 : 0.7,
            stagger: reduceMotion ? 0 : 0.055,
          }, reduceMotion ? 0 : 0.25);
      } else {
        gsap.timeline({
          defaults: { ease: 'power3.in' },
          onComplete: () => gsap.set(root, { visibility: 'hidden' }),
        })
          .to([panel, ...Array.from(layers)], {
            xPercent: -100,
            duration: reduceMotion ? 0 : 0.32,
            stagger: reduceMotion ? 0 : 0.025,
          })
          .to(root, { opacity: 0, duration: reduceMotion ? 0 : 0.14 }, reduceMotion ? 0 : 0.18);
      }
    }, root);

    if (open) closeButtonRef.current?.focus();
    document.body.style.overflow = open ? 'hidden' : '';

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('a[href], button, input, [tabindex]:not([tabindex="-1"])'),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <div ref={rootRef} className="staggered-menu" aria-hidden={!open}>
      <button
        className="staggered-menu-backdrop"
        type="button"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Cerrar menú"
      />
      <div className="staggered-menu-layers" aria-hidden="true">
        <div className="staggered-menu-layer staggered-menu-layer-muted" />
        <div className="staggered-menu-layer staggered-menu-layer-accent" />
      </div>
      <aside
        ref={panelRef}
        id="store-mobile-navigation"
        className="store-mobile-nav-drawer staggered-menu-panel"
        aria-label="Navegación mobile"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="staggered-menu-close"
          onClick={onClose}
          tabIndex={open ? 0 : -1}
          aria-label="Cerrar menú"
        >
          <span>Cerrar</span>
          <span className="staggered-menu-close-icon" aria-hidden="true" />
        </button>
        {children}
      </aside>
    </div>
  );
}
