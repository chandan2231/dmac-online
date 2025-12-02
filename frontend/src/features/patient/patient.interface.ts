export const QUERY_KEYS_FOR_PATIENT = {
  GET_SUBSCRIBED_PRODUCTS: 'getSubscribedProducts',
  GET_EXPERTS: 'getExperts',
  GET_THERAPISTS: 'getTherapists',
  GET_CONSULTATIONS: 'getConsultations',
  GET_THERAPIST_CONSULTATIONS: 'getTherapistConsultations',
  GET_PROFILE: 'getProfile',
} as const;

export interface IExpert {
  id: number;
  name: string;
  email: string;
  country: string;
  province_title: string;
  role: string;
  time_zone: string;
  language_names: string;
}

export interface ISlot {
  slot_id: number;
  is_booked: number; // or boolean, but API returns 0/1 usually from DB, let's assume number or boolean based on controller. Controller says `is_booked: slot.is_booked`.
  start: string;
  end: string;
}

export interface IConsultation {
  id: number;
  expert_name: string;
  consultation_date: string;
  event_start: string;
  event_end: string;
  status: number;
  meet_link: string;
}
