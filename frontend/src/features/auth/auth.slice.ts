import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IAuthState, IUser } from './auth.interface';
import type { IUpdateLanguageDetails } from '../../i18n/language.interface';
import type { IAllowedRoutes } from '../../router/router';

const initialState: IAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  allowedRoutes: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: state => {
      state.loading = true;
    },
    setLoadingTrue: state => {
      state.loading = true;
    },
    setLoadingFalse: state => {
      state.loading = false;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: IUser;
        token: string;
        allowedRoutes: IAllowedRoutes[];
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.allowedRoutes = action.payload.allowedRoutes;
    },
    loginFailure: state => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.allowedRoutes = null;
    },
    logout: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.allowedRoutes = null;
    },
    updateUser: (state, action: PayloadAction<Partial<IUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    purge: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.allowedRoutes = null;
    },
    updateLanguageDetails: (
      state,
      action: PayloadAction<Partial<IUpdateLanguageDetails>>
    ) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const {
  loginStart,
  setLoadingTrue,
  setLoadingFalse,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  updateLanguageDetails,
} = authSlice.actions;

export default authSlice.reducer;
