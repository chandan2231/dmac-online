export const QUERY_KEYS_FOR_ADMIN = {
  GET_PRODUCT_LISTING: 'getProductListing',
  GET_USER_LISTING: 'getUserListing',
} as const;

export interface IProduct {
  id: number;
  product_name: string;
  product_description: string;
  product_amount: number; // cast from string → number
  status: number;
  created_date: string; // could be Date if you want to parse
  updated_date: string;
}

export interface IUpdateProductPayload {
  id: number | string;
  product_name: string;
  product_description: string;
  product_amount: number;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  country: string;
  state: string;
  zip_code: string;
  language: string; // comes as string id like '1'
  language_name: string; // human-readable language label (if provided)
  role: string; // e.g., 'USER'
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
}

export interface IChangeUserPasswordPayload {
  id: number | string;
  password: string;
}

export interface IGetUsersPayload {
  role: string;
}
