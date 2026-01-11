import { type UserRole } from '../features/auth/auth.interface';
import type { MapperObjectKey } from '../components/sidebar/mapped-icons';

// Public Pages
import LoginPage from '../pages/auth/login';
import Register from '../pages/auth/register';
import ForgotPassword from '../pages/auth/forgot-password';
import AuthRedirectHomePage from '../pages/patient/home';
import PageNotFound from '../pages/not-found';
import LandingPageComponent from '../pages/landing-page';
import PublicProductsListingPageComponent from '../pages/products-listing';
import PrivacyPolicyPage from '../pages/privacy-policy';
import TermsOfServicePage from '../pages/terms-of-service';

// Protected Pages
import ResetPassword from '../pages/auth/reset-password';
import VerifyEmail from '../pages/auth/verify-email';
import ProfilePage from '../pages/patient/profile';
import QuestionersPage from '../pages/patient/questioners';

// Admin Pages
import DashboardPageComponent from '../pages/admin/dashboard';
import UsersListingPageComponent from '../pages/admin/users-listing';
import ProductsListingPageComponent from '../pages/admin/products-listing';
import ProductFeatureKeysPageComponent from '../pages/admin/product-feature-keys';
import ConsultantsListingPageComponent from '../pages/admin/consultants-listing';
import TransactionsListingPageComponent from '../pages/admin/transactions-listing';
import TherapistListingPageComponent from '../pages/admin/tharapist-listing';
import ConsultationsListingPageComponent from '../pages/admin/consultations-listing';
import TherapistsConsultationsListingPageComponent from '../pages/admin/therapists-consultations-listing';
import AdminPatientAssessmentPage from '../pages/admin/patient-assessment';

// Developer Pages
import DeveloperPageComponent from '../pages/developer';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ContentOnlyLayout from '../layouts/ContentOnlyLayout';
import BaseLayout from '../layouts/BaseLayout';
import PatientLayout from '../layouts/PatientLayout';

// Patient Pages
import PatientRegisterPage from '../pages/auth/register/patient-register';
import PatientVerifyEmailPage from '../pages/auth/verify-email/patient-verify-email';
// const PatientPaymentPage = lazy(
//   () => import('../pages/payment/patient-payment')
// );
import PatientPaymentPage from '../pages/payment/patient-payment';
import PatientLoginPage from '../pages/auth/login/patient-login';
import PatientPaymentSuccessPage from '../pages/payment/patient-payment-success';
import PatientPaymentCancelledPage from '../pages/payment/patient-payment-cancel';
import PatientProductsPage from '../pages/patient/patient-products';
import PatientAuthWithGooglePage from '../pages/patient/auth-with-google';
import BookConsultationPage from '../pages/patient/book-consultation';
import BookTherapistPage from '../pages/patient/book-therapist';
import UploadDocumentsPage from '../pages/patient/upload-documents';
import CountryAdminListingPage from '../pages/admin/country-admin-listing';

// Expert Pages
import ConsultationListPage from '../pages/expert/consultation-list';
import TransactionHistoryPage from '../pages/expert/transaction-history';
import ExpertHomePage from '../pages/expert/home';
import CalendarPage from '../pages/expert/calendar';
import ExpertReviewsPage from '../pages/expert/reviews';
import PatientAssessmentPage from '../pages/expert/patient-assessment';

// Therapist Pages
import TherapistHomePage from '../pages/therapist/home';
import CalendarPageForTherapist from '../pages/therapist/calendar';
import TherapistConsultationListPage from '../pages/therapist/consultation-list';
import TherapistReviewsPage from '../pages/therapist/reviews';
import TherapistPatientAssessmentPage from '../pages/therapist/patient-assessment';

// Developer Pages

export const LAYOUT_MAP = {
  BaseLayout,
  MainLayout,
  AuthLayout,
  ContentOnlyLayout,
  PatientLayout,
};

export type LayoutType = keyof typeof LAYOUT_MAP;

export const COMPONENT_MAP = {
  // These are the public components that can be accessed without authentication
  LoginPage,
  Register,
  ForgotPassword,
  PageNotFound,
  AuthRedirectHomePage,
  LandingPageComponent,
  PublicProductsListingPageComponent,
  PrivacyPolicyPage,
  TermsOfServicePage,

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
  ProductFeatureKeysPageComponent,
  ConsultantsListingPageComponent,
  TransactionsListingPageComponent,
  TherapistListingPageComponent,
  ConsultationsListingPageComponent,
  TherapistsConsultationsListingPageComponent,
  CountryAdminListingPage,
  AdminPatientAssessmentPage,

  // Patient Pages
  PatientRegisterPage,
  PatientVerifyEmailPage,
  PatientPaymentPage,
  PatientLoginPage,
  PatientPaymentSuccessPage,
  PatientPaymentCancelledPage,
  PatientProductsPage,
  BookConsultationPage,
  BookTherapistPage,
  UploadDocumentsPage,
  PatientAuthWithGooglePage,

  // Expert Pages
  ConsultationListPage,
  TransactionHistoryPage,
  ExpertHomePage,
  CalendarPage,
  ExpertReviewsPage,
  PatientAssessmentPage,

  // Therapist Pages
  TherapistHomePage,
  CalendarPageForTherapist,
  TherapistConsultationListPage,
  TherapistReviewsPage,
  TherapistPatientAssessmentPage,

  // Developer Pages
  DeveloperPageComponent,
};

export type ComponentKey = keyof typeof COMPONENT_MAP;

export const ROUTES = {
  // Public routes
  HOME: '/',
  PRODUCTS_LISTING: '/products',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',

  // USER Authenticated routes
  PATIENT_LOGIN: '/patient/login',
  PATIENT_REGISTRATION: '/patient/registration',
  PATIENT_EMAIL_VERIFICATION: '/patient/email/verify/:token',

  // USER Payment routes
  PATIENT_PAYMENT: '/patient/payment',
  PATIENT_PAYMENT_SUCCESS: '/patient/payment/success',
  PATIENT_PAYMENT_CANCELLED: '/patient/payment/cancelled',
  BOOK_CONSULTATION: '/patient/book-consultation',

  // USER Protected routes
  PROFILE: '/profile',
  QUESTIONERS: '/questioners',
  PATIENT_PRODUCTS: '/patient/products',
  BOOK_THERAPIST: '/patient/book-therapist',
  UPLOAD_DOCUMENTS: '/patient/upload-documents',
  AUTH_WITH_GOOGLE: '/patient/auth-with-google',

  // ADMIN, SUPER_ADMIN Authenticated routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email/:token',
  RESET_PASSWORD: '/reset-password/:token',

  // ADMIN, SUPER_ADMIN, Protected routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  USERS_LISTING: '/admin/users',
  TRANSACTIONS: '/admin/transactions',
  CONSULTANTS: '/admin/consultants',
  PRODUCTS: '/admin/products',
  PRODUCT_FEATURE_KEYS: '/admin/product-feature-keys',
  THERAPISTS: '/admin/therapists',
  CONSULTATIONS: '/admin/consultations',
  THERAPIST_CONSULTATIONS: '/admin/therapists-consultations',
  COUNTRY_ADMIN_LISTING: '/admin/countries-admin-listing',
  ADMIN_PATIENT_ASSESSMENT: '/admin/consultations/:patientId/assessment',

  // Not Found
  NOT_FOUND: '*',

  // EXPERT Protected routes
  EXPERT_CONSULTATIONS: '/expert/consultations',
  EXPERT_PATIENT_ASSESSMENT: '/expert/patient-assessment/:patientId',
  EXPERT_TRANSACTIONS: '/expert/transactions',
  EXPERT_CALENDAR: '/expert/calendar',
  EXPERT_REVIEWS: '/expert/reviews',

  // THERAPIST Protected routes
  THERAPIST_CALENDAR: '/therapist/calendar',
  THERAPIST_CONSULTATION_LIST: '/therapist/consultation-list',
  THERAPIST_PATIENT_ASSESSMENT:
    '/therapist/consultation-list/:patientId/assessment',
  THERAPIST_REVIEWS: '/therapist/reviews',

  // COUNTRY ADMIN Protected routes
  COUNTRY_ADMIN_DASHBOARD: '/country-admin/dashboard',
  COUNTRY_ADMIN_USERS_LISTING: '/country-admin/users',
  COUNTRY_ADMIN_TRANSACTIONS: '/country-admin/transactions',
  COUNTRY_ADMIN_CONSULTANTS: '/country-admin/consultants',
  COUNTRY_ADMIN_THERAPISTS: '/country-admin/therapists',
  COUNTRY_ADMIN_CONSULTATIONS: '/country-admin/consultations',
  COUNTRY_ADMIN_THERAPIST_CONSULTATIONS:
    '/country-admin/therapists-consultations',

  // Developer Route
  DEVELOPER: '/developer',
} as const;

export type ROUTES = (typeof ROUTES)[keyof typeof ROUTES];

export interface IAllowedRoutes {
  path: ROUTES;
  layout: LayoutType;
  component: ComponentKey;
  // additional properties can be added as needed
  showInSidebar: boolean;
  sideBarIcon: MapperObjectKey | null;
  sideBarTitle: string | null;
  sideBarGroupTitle?: string | null;
  sideBarGroupIcon?: MapperObjectKey | null;
  isAChildOf: ROUTES | null;
}

// Here we define the public routes that do not require authentication
export const PUBLIC_ROUTES = [
  // Landing Page
  {
    path: ROUTES.HOME,
    layout: LAYOUT_MAP['BaseLayout'],
    component: COMPONENT_MAP['LandingPageComponent'],
  },
  {
    path: ROUTES.PRODUCTS_LISTING,
    layout: LAYOUT_MAP['BaseLayout'],
    component: COMPONENT_MAP['PublicProductsListingPageComponent'],
  },
  {
    path: ROUTES.PRIVACY_POLICY,
    layout: LAYOUT_MAP['BaseLayout'],
    component: COMPONENT_MAP['PrivacyPolicyPage'],
  },
  {
    path: ROUTES.TERMS_OF_SERVICE,
    layout: LAYOUT_MAP['BaseLayout'],
    component: COMPONENT_MAP['TermsOfServicePage'],
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
  {
    path: ROUTES.DEVELOPER,
    layout: LAYOUT_MAP['BaseLayout'],
    component: COMPONENT_MAP['DeveloperPageComponent'],
  },
];

// For protected routes, we can define them here
// This is just a placeholder for now, as the actual routes will be dynamically rendered based on the backend configuration
// These routes are for Patient
const USER_ROUTES: IAllowedRoutes[] = [
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
    path: ROUTES.AUTH_WITH_GOOGLE,
    layout: 'MainLayout',
    component: 'PatientAuthWithGooglePage',
    showInSidebar: true,
    sideBarTitle: 'Auth With Google',
    sideBarIcon: 'GoogleIcon',
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
    sideBarIcon: 'QuizIcon',
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
  // Payment Related Routes
  {
    path: ROUTES.PATIENT_PRODUCTS,
    layout: 'MainLayout',
    component: 'PatientProductsPage',
    showInSidebar: true,
    sideBarTitle: 'Products',
    sideBarIcon: 'ShoppingCartIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.BOOK_CONSULTATION,
    layout: 'MainLayout',
    component: 'BookConsultationPage',
    showInSidebar: true,
    sideBarTitle: 'Expert Consultation',
    sideBarIcon: 'MedicalServicesIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.BOOK_THERAPIST,
    layout: 'MainLayout',
    component: 'BookTherapistPage',
    showInSidebar: true,
    sideBarTitle: 'Therapist Consultation',
    sideBarIcon: 'PsychologyIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.UPLOAD_DOCUMENTS,
    layout: 'MainLayout',
    component: 'UploadDocumentsPage',
    showInSidebar: true,
    sideBarTitle: 'My Documents',
    sideBarIcon: 'UploadFileIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.PATIENT_PAYMENT,
    layout: 'MainLayout',
    component: 'PatientPaymentPage',
    showInSidebar: false,
    sideBarTitle: null,
    sideBarIcon: null,
    isAChildOf: null,
  },
  {
    path: ROUTES.PATIENT_PAYMENT_SUCCESS,
    layout: 'MainLayout',
    component: 'PatientPaymentSuccessPage',
    showInSidebar: false,
    sideBarTitle: null,
    sideBarIcon: null,
    isAChildOf: null,
  },
  {
    path: ROUTES.PATIENT_PAYMENT_CANCELLED,
    layout: 'MainLayout',
    component: 'PatientPaymentCancelledPage',
    showInSidebar: false,
    sideBarTitle: null,
    sideBarIcon: null,
    isAChildOf: null,
  },
];

const EXPERT_ROUTES: IAllowedRoutes[] = [
  {
    path: ROUTES.HOME,
    layout: 'MainLayout',
    component: 'ExpertHomePage',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Auth With Google',
    sideBarIcon: 'HomeIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.EXPERT_CALENDAR,
    layout: 'MainLayout',
    component: 'CalendarPage',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Calendar',
    sideBarIcon: 'CalendarMonthIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.EXPERT_CONSULTATIONS,
    layout: 'MainLayout',
    component: 'ConsultationListPage',
    showInSidebar: true,
    sideBarTitle: 'Consultations',
    sideBarIcon: 'EventIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.EXPERT_PATIENT_ASSESSMENT,
    layout: 'MainLayout',
    component: 'PatientAssessmentPage',
    showInSidebar: false,
    sideBarTitle: null,
    sideBarIcon: null,
    isAChildOf: ROUTES.EXPERT_CONSULTATIONS,
  },
  {
    path: ROUTES.EXPERT_TRANSACTIONS,
    layout: 'MainLayout',
    component: 'TransactionHistoryPage',
    showInSidebar: true,
    sideBarTitle: 'Transactions',
    sideBarIcon: 'ReceiptLongIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.EXPERT_REVIEWS,
    layout: 'MainLayout',
    component: 'ExpertReviewsPage',
    showInSidebar: true,
    sideBarTitle: 'Reviews',
    sideBarIcon: 'RateReviewIcon',
    isAChildOf: null,
  },
];

const THERAPIST_ROUTES: IAllowedRoutes[] = [
  {
    path: ROUTES.HOME,
    layout: 'MainLayout',
    component: 'TherapistHomePage',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Auth With Google',
    sideBarIcon: 'HomeIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.THERAPIST_CALENDAR,
    layout: 'MainLayout',
    component: 'CalendarPageForTherapist',
    showInSidebar: true,
    sideBarTitle: 'Calendar',
    sideBarIcon: 'CalendarMonthIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.THERAPIST_CONSULTATION_LIST,
    layout: 'MainLayout',
    component: 'TherapistConsultationListPage',
    showInSidebar: true,
    sideBarTitle: 'Consultations',
    sideBarIcon: 'EventIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.THERAPIST_REVIEWS,
    layout: 'MainLayout',
    component: 'TherapistReviewsPage',
    showInSidebar: true,
    sideBarTitle: 'Reviews',
    sideBarIcon: 'RateReviewIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.THERAPIST_PATIENT_ASSESSMENT,
    layout: 'MainLayout',
    component: 'TherapistPatientAssessmentPage',
    showInSidebar: false,
    sideBarTitle: null,
    sideBarIcon: null,
    isAChildOf: ROUTES.THERAPIST_CONSULTATION_LIST,
  },
];

const ADMIN_ROUTES: IAllowedRoutes[] = [
  {
    path: ROUTES.ADMIN_DASHBOARD,
    layout: 'MainLayout',
    component: 'DashboardPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Dashboard',
    sideBarIcon: 'DashboardIcon',
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
    sideBarGroupTitle: 'USERS',
    sideBarGroupIcon: 'GroupIcon',
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
    sideBarGroupTitle: 'USERS',
    sideBarGroupIcon: 'GroupIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.CONSULTANTS,
    layout: 'MainLayout',
    component: 'ConsultantsListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Experts List',
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
    path: ROUTES.COUNTRY_ADMIN_LISTING,
    layout: 'MainLayout',
    component: 'CountryAdminListingPage',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Countries Admin Listing',
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
    path: ROUTES.PRODUCT_FEATURE_KEYS,
    layout: 'MainLayout',
    component: 'ProductFeatureKeysPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Product Feature Keys',
    sideBarIcon: 'ExtensionIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.CONSULTATIONS,
    layout: 'MainLayout',
    component: 'ConsultationsListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Experts Consultations',
    sideBarIcon: 'EventIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.THERAPIST_CONSULTATION_LIST,
    layout: 'MainLayout',
    component: 'TherapistsConsultationsListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Therapists Consultations',
    sideBarIcon: 'EventIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.ADMIN_PATIENT_ASSESSMENT,
    layout: 'MainLayout',
    component: 'AdminPatientAssessmentPage',
    showInSidebar: false,
    sideBarTitle: null,
    sideBarIcon: null,
    isAChildOf: ROUTES.CONSULTATIONS,
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

const GUEST_USER_ROUTES: IAllowedRoutes[] = [
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

const COUNTRY_ADMIN_ROUTES: IAllowedRoutes[] = [
  {
    path: ROUTES.COUNTRY_ADMIN_DASHBOARD,
    layout: 'MainLayout',
    component: 'DashboardPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Dashboard',
    sideBarIcon: 'DashboardIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.COUNTRY_ADMIN_USERS_LISTING,
    layout: 'MainLayout',
    component: 'UsersListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Users List',
    sideBarIcon: 'GroupIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.COUNTRY_ADMIN_TRANSACTIONS,
    layout: 'MainLayout',
    component: 'TransactionsListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'User’s Transactions',
    sideBarIcon: 'ReceiptLongIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.COUNTRY_ADMIN_CONSULTANTS,
    layout: 'MainLayout',
    component: 'ConsultantsListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Experts List',
    sideBarIcon: 'BadgeIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.COUNTRY_ADMIN_THERAPISTS,
    layout: 'MainLayout',
    component: 'TherapistListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Therapists List',
    sideBarIcon: 'BadgeIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.COUNTRY_ADMIN_CONSULTATIONS,
    layout: 'MainLayout',
    component: 'ConsultationsListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Experts Consultations',
    sideBarIcon: 'EventIcon',
    isAChildOf: null,
  },
  {
    path: ROUTES.COUNTRY_ADMIN_THERAPIST_CONSULTATIONS,
    layout: 'MainLayout',
    component: 'TherapistsConsultationsListingPageComponent',
    // This route will be shown in the sidebar
    showInSidebar: true,
    sideBarTitle: 'Therapists Consultations',
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

export const getRoutesByRole = (role: UserRole): IAllowedRoutes[] => {
  if (role === 'USER') {
    return USER_ROUTES;
  }
  if (role === 'EXPERT') {
    return EXPERT_ROUTES;
  }
  if (role === 'THERAPIST') {
    return THERAPIST_ROUTES;
  }
  if (role === 'COUNTRY_ADMIN') {
    return COUNTRY_ADMIN_ROUTES;
  }
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return ADMIN_ROUTES;
  }
  return GUEST_USER_ROUTES;
};
