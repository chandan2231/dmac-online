import { ROUTES, type IUserRoute } from '../../features/auth/auth.interface';

// Public Pages
import LoginPage from '../../pages/login';
import Register from '../../pages/register';
import ForgotPassword from '../../pages/forgot-password';
import HomePage from '../../pages/home';
import PageNotFound from '../../pages/not-found';

// Protected Pages
import DashboardPage from '../../pages/dashboard';
import ResetPassword from '../../pages/reset-password';
import VerifyEmail from '../../pages/verify-email';

// Layouts
import MainLayout from '../../layouts/MainLayout';
import AuthLayout from '../../layouts/AuthLayout';

export const LAYOUT_MAP = {
  MainLayout,
  AuthLayout,
};

export const COMPONENT_MAP = {
  // These are the public components that can be accessed without authentication
  LoginPage,
  Register,
  ForgotPassword,
  PageNotFound,
  HomePage,

  // These are the components that will be dynamically rendered based on the backend configuration
  // and can be accessed only after authentication
  DashboardPage,
  ResetPassword,
  VerifyEmail,
};

export type ComponentKey = keyof typeof COMPONENT_MAP;

// Here we define the public routes that do not require authentication
export const PUBLIC_ROUTES = [
  {
    path: ROUTES.HOME,
    layout: LAYOUT_MAP['MainLayout'],
    component: COMPONENT_MAP['HomePage'],
  },
  {
    path: ROUTES.LOGIN,
    layout: LAYOUT_MAP['AuthLayout'],
    component: COMPONENT_MAP['LoginPage'],
  },
  {
    path: ROUTES.REGISTER,
    layout: LAYOUT_MAP['AuthLayout'],
    component: COMPONENT_MAP['Register'],
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    layout: LAYOUT_MAP['AuthLayout'],
    component: COMPONENT_MAP['ForgotPassword'],
  },
  {
    path: ROUTES.RESET_PASSWORD,
    layout: LAYOUT_MAP['AuthLayout'],
    component: COMPONENT_MAP['ResetPassword'],
  },
  {
    path: ROUTES.NOT_FOUND,
    layout: LAYOUT_MAP['AuthLayout'],
    component: COMPONENT_MAP['PageNotFound'],
  },
];

// For protected routes, we can define them here
// This is just a placeholder for now, as the actual routes will be dynamically rendered based on the backend configuration
// These routes are for Development purposes only
export const DEV_MODE_ROUTES: IUserRoute[] = [
  {
    path: ROUTES.HOME,
    layout: 'MainLayout',
    component: 'HomePage',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Home',
    sideBarIcon: 'HomeIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.VERIFY_EMAIL,
    layout: 'AuthLayout',
    component: 'VerifyEmail',
    showInSidebar: false,
    sideBarTitle: null,
    sideBarIcon: null,
    isAChildOf: null,
  },
  {
    path: ROUTES.NOT_FOUND,
    layout: 'AuthLayout',
    component: 'PageNotFound',
    // This route will not be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Not Found',
    sideBarIcon: 'ErrorIcon',
    isAChildOf: ROUTES.HOME,
  },
];
