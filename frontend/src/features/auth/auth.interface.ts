import type { LanguageCode } from '../../i18n/language.interface';
import type { IAllowedRoutes } from '../../router/router';

export type UserRole =
  | 'USER'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'EXPERT'
  | 'THERAPIST';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  language: string;
  phone: string;
  languageCode: LanguageCode;
  isPaymentDone: boolean | null;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  allowedRoutes: IAllowedRoutes[] | null;
}

// Login payload and response types
export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterResponse {
  isSuccess: boolean;
  message: string;
}

export interface ILoginResponse {
  user: IUser | null;
  token: string | null;
  allowedRoutes: IAllowedRoutes[] | null;
  success: boolean;
  message: string;
}

// Register payload and response types
export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  mobile: string;
}
