import HttpService from '../../services/HttpService';
import { get } from 'lodash';
import type { IUser } from '../auth/auth.interface';

const getSubscribedProduct = async (user: IUser | null) => {
  try {
    const userId = get(user, 'id');
    const response = await HttpService.post(`auth/patient/getProductByUserId`, {
      userId,
    });
    return {
      success: true,
      message: 'Subscribed products fetched successfully',
      productsList: get(response, ['data', 'product'], []),
    };
  } catch (error: unknown) {
    console.error('Error fetching subscribed products:', error);
    const errorMessage =
      'Failed to fetch subscribed products. Please try again later.';
    return {
      success: false,
      message: errorMessage,
      productsList: null,
    };
  }
};

const PatientService = {
  getSubscribedProduct,
};

export default PatientService;
