import type { IUser } from '../auth/auth.interface';

export const QUERY_KEYS_FOR_ADMIN = {
  GET_PRODUCT_LISTING: 'getProductListing',
  GET_USER_LISTING: 'getUserListing',
  GET_TRANSACTION_LISTING: 'getTransactionListing',
  GET_CONSULTANT_LISTING: 'getConsultantListing',
  GET_THERAPIST_LISTING: 'getTherapistListing',
  GET_CONSULTATION_LISTING: 'getConsultationListing',
} as const;

export interface IProductFeature {
  title: string;
  value: string;
}

export interface IProductCountryAmount {
  country_code: string;
  country_name: string;
  currency_code: string;
  currency_symbol: string;
  amount: number;
}

export interface IProduct {
  id: number;
  product_name: string;
  product_description: string;
  product_amount: number; // cast from string → number
  upgrade_priority?: number | null;
  status: number;
  created_date: string; // could be Date if you want to parse
  updated_date: string;
  subscription_list: string; // comma-separated values
  feature: IProductFeature[];
  country_amounts?: IProductCountryAmount[];
}

export interface IUpdateProductPayload {
  id: number | string;
  product_name: string;
  product_description: string;
  product_amount: number;
}

export interface ICreateProductPayload {
  product_name: string;
  product_description: string;
  product_amount: number;
}

export interface IUpdateProductCountryAmountsPayload {
  id: number | string;
  country_amounts: IProductCountryAmount[];
}

export interface IUserDetails extends Omit<IUser, 'id'> {
  id: number;
  mobile: string;
  password?: string;
  country: string;
  state: string;
  zip_code: string;
  language: string; // comes as string id like '1'
  language_name: string; // human-readable language label (if provided)
  time_zone: string;
  address: string;
  speciality: string;
  license_number: string;
  license_expiration: string;
  contracted_rate_per_consult: string;
  verified: number; // 0/1
  verification_token: string;
  status: number; // 0/1
  created_date: string; // ISO string
  updated_date: string; // ISO string
  patient_meta?: string;
}

export interface IChangeUserPasswordPayload {
  id: number | string;
  password: string;
}

export interface ITransaction {
  id: number;
  payment_id: string;
  payer_id: string;
  amount: number | string;
  currency: string;
  status: string;
  protocol_id: string;
  user_id: number;
  payment_type: string; // 'paypal' | 'waive_fee' | etc.
  name: string; // joined from users
  email: string; // joined from users
  protocol_name: string; // research_type from protocols
  protocol_pi: string; // protocol_user_type from protocols
  created_date?: string;
  updated_date?: string;
}

export type TransactionFilter = 'Transaction' | 'Waive Fee' | '';

export interface IConsultant {
  id: number;
  name: string;
  email: string;
  mobile: string;
  status: number;
  created_date: string;
}

export type ConsultantState = IConsultant & {
  name: string;
  address: string;
  speciality: string;
  license_number: string;
  license_expiration: string;
  contracted_rate_per_consult: string;
  country: string;
  time_zone: string;
  province_id: string;
  province_title: string;
  language: string;
  language_name?: string;
  finance_manager_id?: number | null;
};

export interface ICreateConsultantPayload {
  name: string;
  mobile: string;
  email: string;
  password: string;
  role: string; // will be hard-coded as 'EXPERT'
  time_zone: string;
  country: string;
  address: string;
  speciality: string;
  license_number: string;
  license_expiration: string;
  contracted_rate_per_consult: string;
  provinceValue: string;
  provinceTitle: string;
  languages: string;
}

export interface ITherapist {
  id: number;
  name: string;
  email: string;
  mobile: string;
  status: number;
  created_date: string;
}

export type TherapistState = ITherapist & {
  name: string;
  address: string;
  speciality: string;
  license_number: string;
  license_expiration: string;
  contracted_rate_per_consult: string;
  country: string;
  time_zone: string;
  province_id: string;
  province_title: string;
  language: string;
};

export interface ICreateTherapistPayload {
  name: string;
  mobile: string;
  email: string;
  time_zone: string;
  country: string;
  address: string;
  speciality: string;
  license_number: string;
  license_expiration: string;
  contracted_rate_per_consult: string;
  provinceValue: string;
  provinceTitle: string;
}

export interface IGetUsersPayload {
  role: string;
}

export interface IConsultation {
  id: number;
  consultation_id: string;
  user_id: number;
  consultant_id: number;
  product_id: number;
  time_slot: string;
  time_zone: string;
  consultation_date: string;
  consultation_status: number;
  payment_date: string | null;
  created_date: string;
  updated_date: string;
  consultation_notes: string;
  consultant_country: string;
  user_name: string;
  user_email: string;
  consultant_name: string;
  consultant_email: string;
  consultation_country: string;
  product_name: string;
  product_description: string;
  event_start?: string;
  event_end?: string;
  user_timezone?: string;
}

export interface ConsultationFilter {
  consultant_id?: number | null;
  consultant_role?: string;
}
