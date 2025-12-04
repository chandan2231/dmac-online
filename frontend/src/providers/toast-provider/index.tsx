// ToastProvider.tsx
import React, { createContext, useContext, type ReactNode } from 'react';
import { SnackbarProvider, useSnackbar, type VariantType } from 'notistack';
import { ThemedSnackbar } from './components/ThemedSnackbar';

type ToastContextType = {
  showToast: (message: string, variant?: VariantType) => void;
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

  const showToast = (message: string, variant: VariantType = 'default') => {
    enqueueSnackbar(message, { variant });
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
      autoHideDuration={1000}
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
