import type { MapperObjectKey } from '../../components/sidebar/mapped-icons';
import type { LanguageCode } from '../../i18n/language.interface';
import type { ComponentKey } from '../../templates/protected-boundary/mapping';

export type UserRole =
  | 'USER'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'EXPERT'
  | 'THERAPIST';

export type LayoutType =
  | 'MainLayout'
  | 'AuthLayout'
  | 'ContentOnlyLayout'
  | 'BaseLayout'
  | 'PatientLayout';

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

export const ROUTES = {
  // Public routes
  HOME: '/',

  // USER Authenticated routes
  PATIENT_LOGIN: '/patient/login',
  PATIENT_REGISTRATION: '/patient/registration',
  PATIENT_EMAIL_VERIFICATION: '/patient/email/verify/:token',

  // USER Payment routes
  PATIENT_PAYMENT: '/patient/payment',
  PATIENT_PAYMENT_SUCCESS: '/patient/payment/success',
  PATIENT_PAYMENT_CANCELLED: '/patient/payment/cancelled',

  // USER Protected routes
  PROFILE: '/profile',
  QUESTIONERS: '/questioners',
  PATIENT_PRODUCTS: '/patient/products',

  // ADMIN, SUPER_ADMIN, THERAPIST Authenticated routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email/:token',
  RESET_PASSWORD: '/reset-password/:token',

  // ADMIN, SUPER_ADMIN, THERAPIST Protected routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  USERS_LISTING: '/admin/users',
  TRANSACTIONS: '/admin/transactions',
  CONSULTANTS: '/admin/consultants',
  PRODUCTS: '/admin/products',
  THERAPISTS: '/admin/therapists',
  CONSULTATIONS: '/admin/consultations',

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
  sideBarIcon: MapperObjectKey | null;
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
