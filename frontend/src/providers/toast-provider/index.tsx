// ToastProvider.tsx
import React, { createContext, useContext, type ReactNode } from 'react';
import { SnackbarProvider, useSnackbar, type VariantType } from 'notistack';
import { ThemedSnackbar } from './components/ThemedSnackbar';

type ToastContextType = {
  showToast: (message: string, variant?: VariantType, autoHideDurationMs?: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const InnerToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const showToast = (
    message: string,
    variant: VariantType = 'default',
    autoHideDurationMs?: number
  ) => {
    const autoHideDuration =
      typeof autoHideDurationMs === 'number'
        ? autoHideDurationMs
        : variant === 'error'
          ? 8000
          : 4000;
    enqueueSnackbar(message, { variant, autoHideDuration });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <SnackbarProvider
      maxSnack={5}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={4000}
      Components={{
        default: ThemedSnackbar,
        success: ThemedSnackbar,
        error: ThemedSnackbar,
        warning: ThemedSnackbar,
        info: ThemedSnackbar,
      }}
    >
      <InnerToastProvider>{children}</InnerToastProvider>
    </SnackbarProvider>
  );
};
