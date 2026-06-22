import { useState, useCallback } from 'react';
import { DialogContext } from './useDialog';
import type { ConfirmOptions } from './useDialog';
import Dialog from './Dialog';
import type { DialogAction } from './Dialog';

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title?: string;
    content?: React.ReactNode;
    actions?: DialogAction[];
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setDialogState({
        open: true,
        title: options.title ?? 'Confirmar',
        content: <p>{options.message}</p>,
        actions: [
          {
            label: options.cancelLabel ?? 'Cancelar',
            variant: 'text',
            onClick: () => {
              setDialogState(null);
              resolve(false);
            },
          },
          {
            label: options.confirmLabel ?? 'Confirmar',
            variant: options.danger ? 'danger' : 'filled',
            danger: options.danger,
            onClick: () => {
              setDialogState(null);
              resolve(true);
            },
          },
        ],
        resolve,
      });
    });
  }, []);

  const alert = useCallback((message: string, title?: string): Promise<void> => {
    return new Promise(resolve => {
      setDialogState({
        open: true,
        title: title ?? 'Aviso',
        content: <p>{message}</p>,
        actions: [
          {
            label: 'Entendido',
            variant: 'filled',
            onClick: () => {
              setDialogState(null);
              resolve();
            },
          },
        ],
        resolve: () => {},
      });
    });
  }, []);

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {dialogState && (
        <Dialog
          open={dialogState.open}
          onClose={() => {
            dialogState.resolve(false);
            setDialogState(null);
          }}
          title={dialogState.title}
          content={dialogState.content}
          actions={dialogState.actions}
        />
      )}
    </DialogContext.Provider>
  );
}
