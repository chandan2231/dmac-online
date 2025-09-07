import { get } from 'lodash';
import type { IProduct } from './admin.interface';
import moment from 'moment';
import HttpService from '../../services/HttpService';

const getProductsListing = async (): Promise<{
  success: boolean;
  data: IProduct[] | null;
  message: string;
}> => {
  try {
    const response = await HttpService.get('/admin/products/list');

    // ensure product_amount is casted to number
    const products = (get(response, 'data', []) as IProduct[]).map(item => ({
      ...item,
      product_amount: Number(item.product_amount),
      created_date: moment(get(item, 'created_date')).format('YYYY-MM-DD'),
      updated_date: moment(get(item, 'updated_date')).format('YYYY-MM-DD'),
    }));

    return {
      success: true,
      data: products,
      message: 'Products fetched successfully',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while fetching products';

    return {
      success: false,
      data: null,
      message,
    };
  }
};

const AdminService = {
  getProductsListing,
};

export default AdminService;
