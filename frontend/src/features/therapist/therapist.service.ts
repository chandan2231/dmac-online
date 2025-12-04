import HttpService from '../../services/HttpService';
import { get } from 'lodash';

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

const setAvailability = async (
  data: unknown
): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    await HttpService.post('/therapist/save/slot', data);
    return {
      success: true,
      message: 'Availability saved successfully',
    };
  } catch (error: unknown) {
    console.error('Error saving availability:', error);
    return {
      success: false,
      message: 'Failed to save availability',
    };
  }
};

const getTherapistSlots = async ({
  therapistId,
}: {
  therapistId: string | undefined;
}) => {
  try {
    const response = await HttpService.post(`/therapist/get/slots`, {
      consultant_id: therapistId,
    });
    return {
      success: true,
      slots: get(response, 'data.slots'),
    };
  } catch (error: unknown) {
    console.error('Error fetching therapist slots:', error);
    return {
      success: false,
      message: 'Failed to get therapist slots',
    };
  }
};

const toggleDayOff = async (data: {
  consultant_id: string;
  date: string;
  is_day_off: number;
}): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    await HttpService.post('/therapist/toggle-day-off', data);
    return {
      success: true,
      message: 'Day off status updated successfully',
    };
  } catch (error: unknown) {
    console.error('Error updating day off status:', error);
    return {
      success: false,
      message: 'Failed to update day off status',
    };
  }
};

const updateDaySlots = async (data: {
  userId: string;
  date: string;
  slots: Array<{
    start_time: string;
    end_time: string;
    is_slot_available: number;
  }>;
}): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    await HttpService.post('/therapist/update-day-slots', data);
    return {
      success: true,
      message: 'Slots updated successfully',
    };
  } catch (error: unknown) {
    console.error('Error updating slots:', error);
    return {
      success: false,
      message: 'Failed to update slots',
    };
  }
};

const getConsultationList = async (
  consultantId: string,
  patientName?: string
) => {
  try {
    const response = await HttpService.post(`/therapist/consultation-list`, {
      consultant_id: consultantId,
      patient_name: patientName,
    });
    return {
      success: true,
      data: get(response, 'data.data', []),
    };
  } catch (error: unknown) {
    console.error('Error fetching consultation list:', error);
    return {
      success: false,
      message: 'Failed to get consultation list',
      data: [],
    };
  }
};

const updateConsultationStatus = async (data: {
  consultationId: number;
  status: number;
  notes: string;
}): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    await HttpService.post('/therapist/update-status', data);
    return {
      success: true,
      message: 'Consultation status updated successfully',
    };
  } catch (error: unknown) {
    console.error('Error updating consultation status:', error);
    return {
      success: false,
      message: 'Failed to update consultation status',
    };
  }
};

const getTherapistPatients = async ({
  therapistId,
}: {
  therapistId: string | undefined;
}) => {
  try {
    const response = await HttpService.post('/therapist/patients', {
      consultant_id: therapistId,
    });
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching therapist patients:', error);
    return {
      status: 500,
      data: [],
      message: 'Failed to fetch patients',
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

const getPatientDocuments = async (patientId: number) => {
  try {
    const response = await HttpService.post('/therapist/patient-documents', {
      patient_id: patientId,
    });
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching patient documents:', error);
    return {
      status: 500,
      data: [],
      message: 'Failed to fetch documents',
    };
  }
};

const getTherapistReviews = async (therapistId: string) => {
  try {
    const response = await HttpService.get(
      `/reviews/therapist/list/${therapistId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

const TherapistService = {
  getGoogleAuthUrl,
  setAvailability,
  getTherapistSlots,
  toggleDayOff,
  updateDaySlots,
  getConsultationList,
  updateConsultationStatus,
  getTherapistPatients,
  getTherapistReview,
  getPatientDocuments,
  getTherapistReviews,
};

export default TherapistService;
