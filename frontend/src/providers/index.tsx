import ErrorBoundary from '../templates/error-boundary';
import React, { type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../store';
import { ThemeProvider } from './theme-provider/ThemeContext';
import { TanstackProvider } from './tanstack-provider';
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './toast-provider';
import { LanguageConstantProvider } from './language-constant-provider';
import { ROUTES } from '../router/router';

interface IAppProviderProps {
  children: ReactNode;
}

const AppProvider: React.FC<IAppProviderProps> = ({ children }) => {
  return (
    <CookiesProvider defaultSetOptions={{ path: ROUTES.HOME }}>
      <ErrorBoundary>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <TanstackProvider>
              <LanguageConstantProvider>
                <ThemeProvider>
                  <ToastProvider>
                    <BrowserRouter>{children}</BrowserRouter>
                  </ToastProvider>
                </ThemeProvider>
              </LanguageConstantProvider>
            </TanstackProvider>
          </PersistGate>
        </Provider>
      </ErrorBoundary>
    </CookiesProvider>
  );
};

export default AppProvider;
