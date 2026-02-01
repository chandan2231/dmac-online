export interface IPartner {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  country: string | null;
  province_title: string | null;
  province_id: string | null;
  time_zone: string | null;
  zipcode: string | null;
  active_users: number;
  remaining_users: number;
  allowed_users: number;
  created_date: string | null;
  status: number;
}

export interface ICreatePartnerPayload {
  name: string;
  email: string;
  mobile: string;
  address: string;
  country: string;
  state: string; // province_id
  provinceTitle: string;
  provinceValue: string;
  time_zone: string;
  zipcode: string;
  allowed_users: number;
}

export interface IUpdatePartnerPayload extends ICreatePartnerPayload {
  id: number;
}

export interface IChangePartnerPasswordPayload {
  id: number;
  password: string;
}

export interface IAddMorePartnerUsersPayload {
  partner_id: number;
  added_users: number;
  password: string;
}

export interface IPartnerAllowedUsersAddition {
  id: number;
  partner_id: number;
  added_users: number;
  added_by: number;
  added_date: string;
}
