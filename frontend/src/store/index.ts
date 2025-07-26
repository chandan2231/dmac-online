import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/auth.slice';
import logoutReducer, {
  type ILogoutState,
} from '../features/auth/components/logout/logout.slice';
import languageReducer, { type ILanguageState } from '../i18n/language.slice';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import type { IAuthState } from '../features/auth/auth.interface';

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error('No secret key. Add it to .env file');
}

const encryptor = encryptTransform({
  secretKey: SECRET_KEY,
  onError: error => {
    console.error('Encryption error:', error);
  },
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'],
  transforms: [encryptor],
};

const rootReducer = combineReducers({
  auth: authReducer,
  logout: logoutReducer,
  language: languageReducer,
});

interface rootReducer {
  auth: IAuthState;
  logout: ILogoutState;
  language: ILanguageState;
}

const persistedReducer = persistReducer(
  persistConfig,
  rootReducer as typeof rootReducer & rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// Correct typings
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
