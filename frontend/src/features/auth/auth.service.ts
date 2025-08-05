import HttpService from '../../services/HttpService';
import { get } from 'lodash';
import { store } from '../../store';
import { isDevModeActive } from '../../utils/functions';
import {
  UserRole,
  type ILoginPayload,
  type ILoginResponse,
  type IRegisterPayload,
} from './auth.interface';
import {
  loginFailure,
  loginStart,
  loginSuccess,
  setLoadingFalse,
} from './auth.slice';
import { DEV_MODE_ROUTES } from '../../templates/protected-boundary/mapping';

// Simulate a successful login in development mode
const simulateDevLogin = async (
  payload: ILoginPayload
): Promise<ILoginResponse> => {
  const { email } = payload;
  const user = {
    id: 'admin-dev-id-12345',
    name: 'Admin Dev',
    email: email,
    role: UserRole['SUPER_ADMIN'],
  };

  const token = 'dev-token-12345';
  const allowedRoutes = DEV_MODE_ROUTES;

  const successPayload = {
    user,
    token,
    allowedRoutes,
  };

  store.dispatch(loginSuccess(successPayload));

  return {
    user,
    token,
    allowedRoutes,
    success: true,
    message: 'Development login successful',
  };
};

const registerUser = async (
  payload: IRegisterPayload
): Promise<ILoginResponse> => {
  store.dispatch(loginStart()); // optional: create separate registerStart()

  try {
    const response = await HttpService.post<ILoginResponse>(
      '/auth/register',
      payload
    );

    const { token, user, allowedRoutes } = response.data;

    if (token && user && allowedRoutes) {
      const successPayload = { user, token, allowedRoutes };
      store.dispatch(loginSuccess(successPayload)); // or registerSuccess

      return {
        user,
        token,
        allowedRoutes,
        success: true,
        message: 'Registration successful',
      };
    }

    return {
      user: null,
      token: null,
      allowedRoutes: null,
      success: false,
      message: 'Registration failed: Invalid response data',
    };
  } catch (error: unknown) {
    store.dispatch(loginFailure()); // or registerFailure

    const message =
      get(error, 'response.data.message') ||
      'An unexpected error occurred during registration';

    return {
      user: null,
      token: null,
      allowedRoutes: null,
      success: false,
      message,
    };
  }
};

const loginUser = async (payload: ILoginPayload): Promise<ILoginResponse> => {
  store.dispatch(loginStart());

  const { isDev } = isDevModeActive(payload);

  if (isDev) {
    return simulateDevLogin(payload);
  }

  try {
    const response = await HttpService.post<ILoginResponse>(
      '/auth/login',
      payload
    );

    const { token, user, allowedRoutes } = response.data;

    if (token && user && allowedRoutes) {
      const successPayload = {
        user,
        token,
        allowedRoutes,
      };

      store.dispatch(loginSuccess(successPayload));

      return {
        user,
        token,
        allowedRoutes,
        success: true,
        message: 'Login successful',
      };
    }

    return {
      user,
      token,
      allowedRoutes,
      success: false,
      message: 'Login failed: Invalid response data',
    };
  } catch (error: unknown) {
    store.dispatch(loginFailure());

    const message = 'An unexpected error occurred during login';

    return {
      user: null,
      token: null,
      allowedRoutes: null,
      success: false,
      message: get(error as Error, ['message'], message),
    };
  }
};

const forgotPassword = async (payload: { email: string }) => {
  store.dispatch(loginStart()); // Optional: create a separate forgotPasswordStart

  try {
    const response = await HttpService.post<{ message: string }>(
      '/auth/forgot-password',
      payload
    );

    return {
      success: true,
      message: response.data.message || 'Password reset email sent',
    };
  } catch (error: unknown) {
    store.dispatch(loginFailure()); // Optional: use forgotPasswordFailure

    const message =
      get(error, 'response.data.message') ||
      'An unexpected error occurred during password reset';

    return {
      success: false,
      message,
    };
  }
};

const resetPassword = async (payload: {
  password: string;
  token: string;
}): Promise<{ success: boolean; message: string }> => {
  store.dispatch(setLoadingFalse()); // Optional: create a separate resetPasswordStart

  try {
    const response = await HttpService.post<{ message: string }>(
      '/auth/reset-password',
      payload
    );

    return {
      success: true,
      message: response.data.message || 'Password reset successful',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      'An unexpected error occurred during password reset';

    return {
      success: false,
      message,
    };
  }
};

const AuthService = {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
};

export default AuthService;
