import { get } from 'lodash';
import type {
  IProduct,
  IUpdateProductPayload,
  IUser,
  IChangeUserPasswordPayload,
} from './admin.interface';
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

// ✅ Update product
const updateProduct = async (
  payload: IUpdateProductPayload
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/products/update', payload);

    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'Product updated successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while updating product';

    return {
      success: false,
      message,
    };
  }
};

const updateProductStatus = async (
  id: number,
  status: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/products/status/change', {
      id,
      status,
    });

    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'Product status updated successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while updating product status';

    return {
      success: false,
      message,
    };
  }
};

// ✅ Get users by role
const getUsersListing = async (
  role: string
): Promise<{
  success: boolean;
  data: IUser[] | null;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/users/list', { role });

    const users = (get(response, 'data', []) as IUser[]).map(item => ({
      ...item,
      created_date: moment(get(item, 'created_date')).format('YYYY-MM-DD'),
      updated_date: moment(get(item, 'updated_date')).format('YYYY-MM-DD'),
    }));

    return {
      success: true,
      data: users,
      message: 'Users fetched successfully',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while fetching users';

    return {
      success: false,
      data: null,
      message,
    };
  }
};

// ✅ Update user status
const updateUserStatus = async (
  id: number,
  status: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/user/status/change', {
      id,
      status,
    });

    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'User status updated successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while updating user status';

    return {
      success: false,
      message,
    };
  }
};

// ✅ Change user password
const changeUserPassword = async (
  payload: IChangeUserPasswordPayload
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post(
      '/admin/user/reset/password',
      payload
    );

    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'User password reset successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while resetting user password';

    return {
      success: false,
      message,
    };
  }
};

const AdminService = {
  getProductsListing,
  updateProduct, // ✅ export update service
  updateProductStatus,
  getUsersListing,
  updateUserStatus,
  changeUserPassword,
};

export default AdminService;
