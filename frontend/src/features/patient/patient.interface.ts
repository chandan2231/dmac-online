export const QUERY_KEYS_FOR_PATIENT = {
  GET_SUBSCRIBED_PRODUCTS: 'getSubscribedProducts',
  GET_EXPERTS: 'getExperts',
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
