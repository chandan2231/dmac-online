import HttpService from '../../services/HttpService';
import { get } from 'lodash';
import type { IUser } from '../auth/auth.interface';

const getSubscribedProduct = async (user: IUser | null) => {
  try {
    const userId = get(user, 'id');
    const response = await HttpService.post(`auth/patient/getProductByUserId`, {
      userId,
    });
    return get(response, ['data', 'product'], []);
  } catch (error: unknown) {
    console.error('Error fetching subscribed products:', error);
    return null;
  }
};

const getExpertList = async (user: IUser | null) => {
  try {
    const userId = get(user, 'id');
    const response = await HttpService.getAxiosClient().post(
      `patient/expert-list`,
      {
        userId,
      }
    );
    return get(response, ['data'], []);
  } catch (error: unknown) {
    console.error('Error fetching expert list:', error);
    return [];
  }
};

const PatientService = {
  getSubscribedProduct,
  getExpertList,
};

export default PatientService;
