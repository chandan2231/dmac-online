import { get } from 'lodash';
import { store } from '../../store';
import {
  type ILoginPayload,
  type ILoginResponse,
  type IRegisterPayload,
  type IRegisterResponse,
  type IUser,
  type UserRole,
} from './auth.interface';
import {
  loginFailure,
  loginSuccess,
  setLoadingFalse,
  setLoadingTrue,
} from './auth.slice';
import { getRoutesByRole } from '../../router/router';
import HttpService from '../../services/HttpService';

const patientResgistration = async (
  payload: IRegisterPayload
): Promise<IRegisterResponse> => {
  store.dispatch(setLoadingTrue()); // optional: create separate registerStart()

  try {
    const response = await HttpService.post<IRegisterResponse>(
      '/auth/patient/registration',
      payload
    );

    const { isSuccess, message } = response.data;

    store.dispatch(setLoadingFalse()); // or registerFailure

    return {
      isSuccess: isSuccess,
      message:
        message ||
        (isSuccess ? 'Registration successful' : 'Registration failed'),
    };
  } catch (error: unknown) {
    store.dispatch(setLoadingFalse()); // or registerFailure

    const message =
      get(error, 'response.data.message') ||
      'An unexpected error occurred during registration';

    return {
      isSuccess: false,
      message: message || 'Registration failed due to an error',
    };
  }
};

const registerUser = async (
  payload: IRegisterPayload
): Promise<IRegisterResponse> => {
  store.dispatch(setLoadingTrue()); // optional: create separate registerStart()

  try {
    const response = await HttpService.post<IRegisterResponse>(
      '/auth/register',
      payload
    );

    const { isSuccess, message } = response.data;

    store.dispatch(setLoadingFalse()); // or registerFailure

    return {
      isSuccess: isSuccess,
      message:
        message ||
        (isSuccess ? 'Registration successful' : 'Registration failed'),
    };
  } catch (error: unknown) {
    store.dispatch(setLoadingFalse()); // or registerFailure

    const message =
      get(error, 'response.data.message') ||
      'An unexpected error occurred during registration';

    return {
      isSuccess: false,
      message: message || 'Registration failed due to an error',
    };
  }
};

const loginUser = async (payload: ILoginPayload): Promise<ILoginResponse> => {
  store.dispatch(setLoadingTrue());

  try {
    const response = await HttpService.post<ILoginResponse>(
      '/auth/login',
      payload
    );

    const user = get(response, ['data', 'user'], null) as IUser | null;
    const token = get(response, ['data', 'user', 'token'], null) as
      | string
      | null;
    const allowedRoutes = getRoutesByRole(
      get(response, ['data', 'user', 'role'], 'USER') as UserRole
    );

    if (token && user && allowedRoutes) {
      const updatedUser = {
        ...user,
        token: token,
        role: get(response, ['data', 'user', 'role'], 'USER') as UserRole,
      };
      const successPayload = {
        user: updatedUser,
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

    store.dispatch(setLoadingFalse());

    return {
      user: null,
      token: null,
      allowedRoutes: null,
      success: false,
      message: get(response, ['data', 'error'], 'Login failed'),
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

const patientLogin = async (
  payload: ILoginPayload
): Promise<ILoginResponse> => {
  store.dispatch(setLoadingTrue());

  try {
    const response = await HttpService.post<ILoginResponse>(
      '/auth/patient/login',
      payload
    );

    const user = get(response, ['data', 'user'], null) as IUser | null;
    const token = get(response, ['data', 'user', 'token'], null) as
      | string
      | null;
    const role = get(response, ['data', 'user', 'role'], 'USER') as UserRole;
    const isPaymentDone =
      role === 'USER'
        ? Boolean(Number(get(user, ['patient_payment'], 0)))
        : null;
    const allowedRoutes = getRoutesByRole(
      get(response, ['data', 'user', 'role']) as UserRole
    );

    if (token && user && allowedRoutes) {
      const updatedUser = {
        ...user,
        token: token,
        role: role,
        isPaymentDone,
      };
      const successPayload = {
        user: updatedUser,
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

    store.dispatch(setLoadingFalse());

    return {
      user: null,
      token: null,
      allowedRoutes: null,
      success: false,
      message: get(response, ['data', 'error'], 'Login failed'),
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
  store.dispatch(setLoadingTrue());

  try {
    const response = await HttpService.post<{ msg?: string; message?: string }>(
      '/auth/verify/username',
      payload
    );

    store.dispatch(setLoadingFalse());

    return {
      success: true,
      message:
        response.data.message ||
        response.data.msg ||
        'Password reset email sent',
    };
  } catch (error: unknown) {
    store.dispatch(loginFailure());

    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.msg') ||
      get(error, 'response.data.error') ||
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
  store.dispatch(setLoadingTrue()); // Optional: create a separate resetPasswordStart

  try {
    const response = await HttpService.post<{ message: string }>(
      'auth/password/reset',
      payload
    );

    store.dispatch(setLoadingFalse()); // Optional: use resetPasswordSuccess

    const message = get(
      response,
      ['data', 'message'],
      'Password reset successful'
    );

    return {
      success: true,
      message: message || 'Password reset successful',
    };
  } catch (error: unknown) {
    store.dispatch(loginFailure()); // Optional: use resetPasswordFailure

    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.msg') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred during password reset';

    return {
      success: false,
      message,
    };
  }
};

const getEmailVerification = async (payload: { token: string }) => {
  try {
    const response = await HttpService.post<{ message: string }>(
      '/auth/email/verify',
      { token: payload.token } // send in body
    );

    return {
      success: true,
      message: response.data.message || 'Email verified successfully',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.error') ||
      'An unexpected error occurred during email verification';

    return {
      success: false,
      message,
    };
  }
};

const getPatientEmailVerification = async (payload: { token: string }) => {
  try {
    const response = await HttpService.post<{ message: string }>(
      '/auth/patient/email/verify',
      { token: payload.token } // send in body
    );

    return {
      success: true,
      message: response.data.message || 'Email verified successfully',
      user: get(response, ['data', 'user'], null) as IUser | null,
      product: get(response, ['data', 'product'], null) as unknown,
      isPartnerUser: Boolean(
        get(response, ['data', 'is_partner_user'], false) ||
          get(response, ['data', 'user', 'partner_id'], null)
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.error') ||
      'An unexpected error occurred during email verification';

    return {
      success: false,
      message,
    };
  }
};

const AuthService = {
  loginUser,
  patientLogin,
  registerUser,
  forgotPassword,
  resetPassword,
  getEmailVerification,
  patientResgistration,
  getPatientEmailVerification,
};

export default AuthService;
