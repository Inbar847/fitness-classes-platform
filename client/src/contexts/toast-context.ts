import { createContext } from 'react';

export type ToastType = 'success' | 'error';

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);