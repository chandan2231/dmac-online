import HttpService from '../../services/HttpService';
import { get } from 'lodash';
import type { IUser } from '../auth/auth.interface';
import type { IProfileData } from './profile';

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

const getTherapistList = async (user: IUser | null, date?: string) => {
  try {
    const userId = get(user, 'id');
    const response = await HttpService.getAxiosClient().post(
      `patient/therapist-list`,
      {
        userId,
        date,
      }
    );
    return get(response, ['data'], []);
  } catch (error: unknown) {
    console.error('Error fetching therapist list:', error);
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

const getTherapistSlots = async (
  user: IUser | null,
  therapistId: number,
  date: string
) => {
  try {
    const userId = get(user, 'id');
    const response = await HttpService.getAxiosClient().post(
      `patient/therapist-slot`,
      {
        user_id: userId,
        consultation_id: therapistId,
        date,
      }
    );
    return get(response, ['data']);
  } catch (error: unknown) {
    console.error('Error fetching therapist slots:', error);
    return { slots: [] };
  }
};

const bookConsultation = async (
  user: IUser | null,
  expertId: number,
  date: string,
  startTime: string,
  productId: number
) => {
  try {
    const userId = get(user, 'id');
    const response = await HttpService.getAxiosClient().post(
      `patient/book/consultation`,
      {
        user_id: userId,
        consultant_id: expertId,
        date,
        start_time: startTime,
        product_id: productId,
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error booking consultation:', error);
    return null;
  }
};

const bookTherapistConsultation = async (
  user: IUser | null,
  therapistId: number,
  date: string,
  startTime: string,
  productId: number
) => {
  try {
    const userId = get(user, 'id');
    const response = await HttpService.getAxiosClient().post(
      `patient/book/therapist-consultation`,
      {
        user_id: userId,
        consultant_id: therapistId,
        date,
        start_time: startTime,
        product_id: productId,
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error booking therapist consultation:', error);
    return null;
  }
};

const getConsultationList = async (user: IUser | null) => {
  try {
    const userId = get(user, 'id');
    const response = await HttpService.getAxiosClient().post(
      `patient/consultation-list`,
      {
        user_id: userId,
      }
    );
    return get(response, ['data', 'data'], []);
  } catch (error: unknown) {
    console.error('Error fetching consultation list:', error);
    return [];
  }
};

const getTherapistConsultationList = async (user: IUser | null) => {
  try {
    const userId = get(user, 'id');
    const response = await HttpService.getAxiosClient().post(
      `patient/therapist-consultation-list`,
      {
        user_id: userId,
      }
    );
    return get(response, ['data', 'data'], []);
  } catch (error: unknown) {
    console.error('Error fetching therapist consultation list:', error);
    return [];
  }
};

const rescheduleTherapistConsultation = async (
  consultationId: number,
  date: string,
  startTime: string,
  userTimezone: string
) => {
  try {
    const response = await HttpService.getAxiosClient().post(
      `patient/reschedule/therapist-consultation`,
      {
        consultation_id: consultationId,
        date,
        start_time: startTime,
        user_timezone: userTimezone,
      }
    );
    return get(response, ['data'], {});
  } catch (error: unknown) {
    console.error('Error rescheduling therapist consultation:', error);
    return { rescheduled: false, message: 'Failed to reschedule.' };
  }
};

const rescheduleConsultation = async (
  consultationId: number,
  date: string,
  startTime: string,
  userTimezone: string
) => {
  try {
    const response = await HttpService.getAxiosClient().post(
      `patient/reschedule/consultation`,
      {
        consultation_id: consultationId,
        date,
        start_time: startTime,
        user_timezone: userTimezone,
      }
    );
    return get(response, ['data'], {});
  } catch (error: unknown) {
    console.error('Error rescheduling consultation:', error);
    return { rescheduled: false, message: 'Failed to reschedule.' };
  }
};

const getProfile = async (user: IUser | null) => {
  try {
    const user_id = get(user, 'id');
    const response = await HttpService.getAxiosClient().post(
      `patient/profile`,
      {
        user_id,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

const updateProfile = async (user: IUser | null, data: IProfileData) => {
  try {
    const user_id = get(user, 'id');
    const response = await HttpService.getAxiosClient().post(
      `patient/profile/update`,
      {
        user_id,
        ...data,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};

const addExpertReview = async (data: Record<string, unknown>) => {
  try {
    const response = await HttpService.post(`reviews/expert`, data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error adding expert review:', error);
    return {
      error: true,
      message: get(error, 'response.data', 'Failed to add review'),
    };
  }
};

const getExpertReview = async (consultationId: number) => {
  try {
    const response = await HttpService.get(`reviews/expert/${consultationId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching expert review:', error);
    return null;
  }
};

const addTherapistReview = async (data: Record<string, unknown>) => {
  try {
    const response = await HttpService.post(`reviews/therapist`, data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error adding therapist review:', error);
    return {
      error: true,
      message: get(error, 'response.data', 'Failed to add review'),
    };
  }
};

const getTherapistReview = async (consultationId: number) => {
  try {
    const response = await HttpService.get(
      `reviews/therapist/${consultationId}`
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching therapist review:', error);
    return null;
  }
};

const uploadDocument = (formData: FormData) => {
  return HttpService.getAxiosClient().post(
    '/patient/upload-document',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

const getUserDocuments = () => {
  return HttpService.get('/patient/documents');
};

const deleteDocument = (id: number) => {
  return HttpService.delete(`/patient/documents/${id}`);
};

const getGoogleAuthUrl = async (): Promise<{
  success: boolean;
  url?: string;
  message?: string;
}> => {
  try {
    const response = await HttpService.get('/google/url');
    return {
      success: true,
      url: get(response, 'data.url'),
    };
  } catch (error: unknown) {
    console.error('Error fetching Google Auth URL:', error);
    return {
      success: false,
      message: 'Failed to get Google Auth URL',
    };
  }
};

const getAssessmentStatus = async () => {
  try {
    const response = await HttpService.getAxiosClient().get(
      `patient/assessment-status`
    );
    return response;
  } catch (error: unknown) {
    console.error('Error fetching assessment status:', error);
    throw error;
  }
};

const submitAssessmentTab = async (tab: string, data: any) => {
  try {
    const response = await HttpService.getAxiosClient().post(
      `patient/assessment-submit`,
      { tab, data }
    );
    return response;
  } catch (error: unknown) {
    console.error('Error submitting assessment:', error);
    throw error;
  }
};

const getLatestMedicalHistory = async () => {
  try {
    const response = await HttpService.getAxiosClient().get(
      `patient/medical-history/latest`
    );
    return response;
  } catch (error: unknown) {
    console.error('Error fetching medical history:', error);
    throw error;
  }
};

const submitMedicalHistory = async (data: unknown) => {
  try {
    const response = await HttpService.getAxiosClient().post(
      `patient/medical-history`,
      { data }
    );
    return response;
  } catch (error: unknown) {
    console.error('Error submitting medical history:', error);
    throw error;
  }
};

const PatientService = {
  getSubscribedProduct,
  getExpertList,
  getTherapistList,
  getExpertSlots,
  getTherapistSlots,
  bookConsultation,
  bookTherapistConsultation,
  getConsultationList,
  getTherapistConsultationList,
  rescheduleTherapistConsultation,
  rescheduleConsultation,
  getProfile,
  updateProfile,
  addExpertReview,
  getExpertReview,
  addTherapistReview,
  getTherapistReview,
  uploadDocument,
  getUserDocuments,
  deleteDocument,
  getGoogleAuthUrl,
  getAssessmentStatus,
  submitAssessmentTab,
  getLatestMedicalHistory,
  submitMedicalHistory,
};

export default PatientService;
