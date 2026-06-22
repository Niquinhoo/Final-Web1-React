import { createContext, useContext } from 'react';

export interface SnackbarData {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface SnackbarContextValue {
  show: (message: string, options?: { actionLabel?: string; onAction?: () => void }) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue>({ show: () => {} });

export function useSnackbar(): SnackbarContextValue {
  return useContext(SnackbarContext);
}
