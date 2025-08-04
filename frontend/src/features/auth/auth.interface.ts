import type { ComponentKey } from '../../templates/protected-boundary/mapping';

export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin',
};

export type LayoutType = 'MainLayout' | 'AuthLayout';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: (typeof UserRole)[keyof typeof UserRole];
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

export interface ILoginResponse {
  token: string | null;
  user: IUser | null;
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
