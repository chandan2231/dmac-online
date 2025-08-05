import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IAuthState, IUser, IUserRoute } from './auth.interface';

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
    setLoadingFalse: state => {
      state.loading = false;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: IUser;
        token: string;
        allowedRoutes: IUserRoute[];
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
  },
});

export const {
  loginStart,
  setLoadingFalse,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
