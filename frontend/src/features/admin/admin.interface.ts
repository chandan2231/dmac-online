export const QUERY_KEYS_FOR_ADMIN = {
  GET_PRODUCT_LISTING: 'getProductListing',
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
