import {
  ROUTES,
  type IUserRoute,
  type UserRole,
} from '../../features/auth/auth.interface';

// Public Pages
import LoginPage from '../../pages/auth/login';
import Register from '../../pages/auth/register';
import ForgotPassword from '../../pages/auth/forgot-password';
import AuthRedirectHomePage from '../../pages/user/home';
import PageNotFound from '../../pages/not-found';
import LandingPageComponent from '../../pages/landing-page';

// Protected Pages
import ResetPassword from '../../pages/auth/reset-password';
import VerifyEmail from '../../pages/auth/verify-email';
import ProfilePage from '../../pages/user/profile';
import QuestionersPage from '../../pages/user/questioners';

// Admin Pages
import DashboardPageComponent from '../../pages/admin/dashboard';
import UsersListingPageComponent from '../../pages/admin/users-listing';
import ProductsListingPageComponent from '../../pages/admin/products-listing';
import ConsultantsListingPageComponent from '../../pages/admin/consultants-listing';
import TransactionsListingPageComponent from '../../pages/admin/transactions-listing';
import TherapistListingPageComponent from '../../pages/admin/tharapist-listing';
import ConsultationsListingPageComponent from '../../pages/admin/consultations-listing';

// Layouts
import MainLayout from '../../layouts/MainLayout';
import AuthLayout from '../../layouts/AuthLayout';
import ContentOnlyLayout from '../../layouts/ContentOnlyLayout';
import BaseLayout from '../../layouts/BaseLayout';
import PatientLayout from '../../layouts/PatientLayout';

// Patient Pages
import PatientRegisterPage from '../../pages/auth/register/patient-register';
import PatientVerifyEmailPage from '../../pages/auth/verify-email/patient-verify-email';
import PatientPaymentPage from '../../pages/payment/patient-payment';
import PatientLoginPage from '../../pages/auth/login/patient-login';
import PatientPaymentSuccessPage from '../../pages/payment/patient-payment-success';
import PatientPaymentCancelledPage from '../../pages/payment/patient-payment-cancel';

export const LAYOUT_MAP = {
  BaseLayout,
  MainLayout,
  AuthLayout,
  ContentOnlyLayout,
  PatientLayout,
};

export const COMPONENT_MAP = {
  // These are the public components that can be accessed without authentication
  LoginPage,
  Register,
  ForgotPassword,
  PageNotFound,
  AuthRedirectHomePage,
  LandingPageComponent,

  // These are the components that will be dynamically rendered based on the backend configuration
  // and can be accessed only after authentication
  ResetPassword,
  VerifyEmail,
  ProfilePage,
  QuestionersPage,

  // Admin Components
  DashboardPageComponent,
  UsersListingPageComponent,
  ProductsListingPageComponent,
  ConsultantsListingPageComponent,
  TransactionsListingPageComponent,
  TherapistListingPageComponent,
  ConsultationsListingPageComponent,

  // Patient Pages
  PatientRegisterPage,
  PatientVerifyEmailPage,
  PatientPaymentPage,
  PatientLoginPage,
  PatientPaymentSuccessPage,
  PatientPaymentCancelledPage,
};

export type ComponentKey = keyof typeof COMPONENT_MAP;

// Here we define the public routes that do not require authentication
export const PUBLIC_ROUTES = [
  // Landing Page
  {
    path: ROUTES.HOME,
    layout: LAYOUT_MAP['BaseLayout'],
    component: COMPONENT_MAP['LandingPageComponent'],
  },
  // Admin, Therapist, Super Admin and Expert Login and Registration Routes
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
    path: ROUTES.VERIFY_EMAIL,
    layout: LAYOUT_MAP['AuthLayout'],
    component: COMPONENT_MAP['VerifyEmail'],
  },
  {
    path: ROUTES.NOT_FOUND,
    layout: LAYOUT_MAP['ContentOnlyLayout'],
    component: COMPONENT_MAP['PageNotFound'],
  },
  // Patient Registration Routes
  {
    path: ROUTES.PATIENT_REGISTRATION,
    layout: LAYOUT_MAP['PatientLayout'],
    component: COMPONENT_MAP['PatientRegisterPage'],
  },
  {
    path: ROUTES.PATIENT_EMAIL_VERIFICATION,
    layout: LAYOUT_MAP['AuthLayout'],
    component: COMPONENT_MAP['PatientVerifyEmailPage'],
  },
  {
    path: ROUTES.PATIENT_PAYMENT,
    layout: LAYOUT_MAP['PatientLayout'],
    component: COMPONENT_MAP['PatientPaymentPage'],
  },
  {
    path: ROUTES.PATIENT_PAYMENT_SUCCESS,
    layout: LAYOUT_MAP['PatientLayout'],
    component: COMPONENT_MAP['PatientPaymentSuccessPage'],
  },
  {
    path: ROUTES.PATIENT_PAYMENT_CANCELLED,
    layout: LAYOUT_MAP['PatientLayout'],
    component: COMPONENT_MAP['PatientPaymentCancelledPage'],
  },
  {
    path: ROUTES.PATIENT_LOGIN,
    layout: LAYOUT_MAP['PatientLayout'],
    component: COMPONENT_MAP['PatientLoginPage'],
  },
];

// For protected routes, we can define them here
// This is just a placeholder for now, as the actual routes will be dynamically rendered based on the backend configuration
// These routes are for Patient
const USER_ROUTES: IUserRoute[] = [
  {
    path: ROUTES.HOME,
    layout: 'MainLayout',
    component: 'AuthRedirectHomePage',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Home',
    sideBarIcon: 'HomeIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.RESET_PASSWORD,
    layout: 'AuthLayout',
    component: 'ResetPassword',
    showInSidebar: false,
    sideBarTitle: null,
    sideBarIcon: null,
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
    path: ROUTES.PROFILE,
    layout: 'MainLayout',
    component: 'ProfilePage',
    showInSidebar: true,
    sideBarTitle: 'Profile',
    sideBarIcon: 'AccountBoxIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.QUESTIONERS,
    layout: 'MainLayout',
    component: 'QuestionersPage',
    showInSidebar: true,
    sideBarTitle: 'Questioners',
    sideBarIcon: null,
    isAChildOf: null,
  },
  {
    path: ROUTES.NOT_FOUND,
    layout: 'ContentOnlyLayout',
    component: 'PageNotFound',
    showInSidebar: false,
    sideBarTitle: null,
    sideBarIcon: null,
    isAChildOf: null,
  },
];

const ADMIN_ROUTES: IUserRoute[] = [
  {
    path: ROUTES.ADMIN_DASHBOARD,
    layout: 'MainLayout',
    component: 'DashboardPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Dashboard',
    sideBarIcon: 'GroupIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.USERS_LISTING,
    layout: 'MainLayout',
    component: 'UsersListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Users List',
    sideBarIcon: 'GroupIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.TRANSACTIONS,
    layout: 'MainLayout',
    component: 'TransactionsListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'User’s Transactions',
    sideBarIcon: 'ReceiptLongIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.CONSULTANTS,
    layout: 'MainLayout',
    component: 'ConsultantsListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Consultants List',
    sideBarIcon: 'BadgeIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.THERAPISTS,
    layout: 'MainLayout',
    component: 'TherapistListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Therapists List',
    sideBarIcon: 'BadgeIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.PRODUCTS,
    layout: 'MainLayout',
    component: 'ProductsListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Products List',
    sideBarIcon: 'InventoryIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.CONSULTATIONS,
    layout: 'MainLayout',
    component: 'ConsultationsListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Consultations List',
    sideBarIcon: 'EventIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.NOT_FOUND,
    layout: 'ContentOnlyLayout',
    component: 'PageNotFound',
    showInSidebar: false,
    sideBarTitle: null,
    sideBarIcon: null,
    isAChildOf: null,
  },
];

const GUEST_USER_ROUTES: IUserRoute[] = [
  {
    path: ROUTES.HOME,
    layout: 'ContentOnlyLayout',
    component: 'PageNotFound',
    showInSidebar: false,
    sideBarTitle: null,
    sideBarIcon: null,
    isAChildOf: null,
  },
  {
    path: ROUTES.NOT_FOUND,
    layout: 'ContentOnlyLayout',
    component: 'PageNotFound',
    showInSidebar: false,
    sideBarTitle: null,
    sideBarIcon: null,
    isAChildOf: null,
  },
];

export const getRoutesByRole = (role: UserRole): IUserRoute[] => {
  if (role === 'USER') {
    return USER_ROUTES;
  }
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return ADMIN_ROUTES;
  }
  return GUEST_USER_ROUTES;
};
