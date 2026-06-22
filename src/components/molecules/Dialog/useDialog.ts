import { createContext, useContext } from 'react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export interface DialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (message: string, title?: string) => Promise<void>;
}

export const DialogContext = createContext<DialogContextValue>({
  confirm: async () => false,
  alert: async () => {},
});

export function useDialog(): DialogContextValue {
  return useContext(DialogContext);
}
