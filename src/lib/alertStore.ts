import { create } from 'zustand';

interface AlertOptions {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  onConfirm?: () => void;
}

interface AlertStore {
  isOpen: boolean;
  options: AlertOptions | null;
  showAlert: (options: AlertOptions) => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  isOpen: false,
  options: null,
  showAlert: (options) => set({ isOpen: true, options }),
  closeAlert: () => set({ isOpen: false }),
}));
