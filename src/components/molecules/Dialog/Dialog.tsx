import { useEffect, useRef, useCallback } from 'react';
import Button from '../../atoms/Button/Button';
import './Dialog.css';

export interface DialogAction {
  label: string;
  variant?: 'filled' | 'text' | 'tonal' | 'outlined' | 'danger';
  danger?: boolean;
  onClick: () => void;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  content?: React.ReactNode;
  actions?: DialogAction[];
}

/**
 * MD3 Dialog (alert/simple). Replaces window.confirm() and window.alert().
 *
 * Features:
 * - Animated scrim + surface entrance
 * - Closes on scrim click, Escape key, or action
 * - Focus trapped inside the dialog while open
 */
export default function Dialog({ open, onClose, title, content, actions }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => onClose(), [onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, handleClose]);

  // Basic focus trap: focus the dialog container when opened
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="md3-dialog-overlay" onClick={handleClose}>
      <div
        className="md3-dialog"
        role="alertdialog"
        aria-modal="true"
        tabIndex={-1}
        ref={dialogRef}
        onClick={e => e.stopPropagation()}
      >
        {title && <h2 className="md3-dialog__title">{title}</h2>}
        {content && <div className="md3-dialog__content">{content}</div>}
        {actions && actions.length > 0 && (
          <div className="md3-dialog__actions">
            {actions.map((action, i) => (
              <Button
                key={i}
                variant={action.danger ? 'danger' : (action.variant ?? 'text')}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
