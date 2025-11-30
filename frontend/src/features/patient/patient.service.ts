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

const getExpertSlots = async (
  user: IUser | null,
  expertId: number,
  date: string
) => {
  try {
    const userId = get(user, 'id');
    const response = await HttpService.getAxiosClient().post(
      `patient/expert-slot`,
      {
        user_id: userId,
        consultation_id: expertId,
        date,
      }
    );
    return get(response, ['data', 'slots'], []);
  } catch (error: unknown) {
    console.error('Error fetching expert slots:', error);
    return [];
  }
};

const PatientService = {
  getSubscribedProduct,
  getExpertList,
  getExpertSlots,
};

export default PatientService;
