import { useEffect, useState, useCallback } from 'react';
import { SnackbarContext } from './useSnackbar';
import type { SnackbarData } from './useSnackbar';
import './Snackbar.css';

let nextId = 0;

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarData | null>(null);

  const show = useCallback(
    (message: string, options?: { actionLabel?: string; onAction?: () => void }) => {
      setSnackbar(null);
      requestAnimationFrame(() => {
        setSnackbar({
          id: ++nextId,
          message,
          actionLabel: options?.actionLabel,
          onAction: options?.onAction,
        });
      });
    },
    [],
  );

  const dismiss = useCallback(() => setSnackbar(null), []);

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      {snackbar && <SnackbarItem data={snackbar} onDismiss={dismiss} />}
    </SnackbarContext.Provider>
  );
}

function SnackbarItem({ data, onDismiss }: { data: SnackbarData; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [data.id, onDismiss]);

  return (
    <div className="md3-snackbar" role="status" aria-live="polite">
      <span className="md3-snackbar__message">{data.message}</span>
      {data.actionLabel && (
        <button
          type="button"
          className="md3-snackbar__action"
          onClick={() => {
            data.onAction?.();
            onDismiss();
          }}
        >
          {data.actionLabel}
        </button>
      )}
    </div>
  );
}
