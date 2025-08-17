import type { ComponentKey } from '../../templates/protected-boundary/mapping';
import type { LanguageCode } from '../../types/global';

export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin',
};

export type LayoutType = 'MainLayout' | 'AuthLayout' | 'ContentOnlyLayout';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: (typeof UserRole)[keyof typeof UserRole];
  token: string;
  language: string;
  phone: string;
  languageCode: LanguageCode;
}

export const ROUTES = {
  // Public routes
  HOME: '/',

  // Authenticated routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Protected routes
  DASHBOARD: '/dashboard',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email/:token',
  PROFILE: '/profile',
  QUESTIONERS: '/questioners',

  // Not Found
  NOT_FOUND: '*',
} as const;

export type ROUTES = (typeof ROUTES)[keyof typeof ROUTES];

export interface IUserRoute {
  path: ROUTES;
  layout: LayoutType;
  component: ComponentKey;
  // additional properties can be added as needed
  showInSidebar: boolean;
  sideBarIcon: string | null;
  sideBarTitle: string | null;
  isAChildOf: ROUTES | null;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  allowedRoutes: IUserRoute[] | null;
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
  allowedRoutes: IUserRoute[] | null;
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
