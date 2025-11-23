import HttpService from '../../services/HttpService';
import { get } from 'lodash';
import type { IUser } from '../auth/auth.interface';

const getSubscribedProduct = async (user: IUser | null) => {
  try {
    const userId = get(user, 'id');
    const response = await HttpService.get(
      `/patient/subscribed-products/${userId}`
    );
    return {
      success: true,
      message: 'Subscribed products fetched successfully',
      data: get(response, 'data', []),
    };
  } catch (error: unknown) {
    console.error('Error fetching subscribed products:', error);
    const errorMessage =
      'Failed to fetch subscribed products. Please try again later.';
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

const PatientService = {
  getSubscribedProduct,
};

export default PatientService;
