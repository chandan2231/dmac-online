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
    await HttpService.post('/expert/save/slot', data);
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

const getExpertSlots = async ({
  expertId,
}: {
  expertId: string | undefined;
}) => {
  try {
    const response = await HttpService.post(`/expert/get/slots`, {
      consultant_id: expertId,
    });
    return {
      success: true,
      slots: get(response, 'data.slots'),
    };
  } catch (error: unknown) {
    console.error('Error fetching expert slots:', error);
    return {
      success: false,
      message: 'Failed to get expert slots',
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
    await HttpService.post('/expert/toggle-day-off', data);
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
    await HttpService.post('/expert/update-day-slots', data);
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

const getConsultations = async (
  expertId: string
): Promise<{
  success: boolean;
  data?: any[];
  message?: string;
}> => {
  try {
    const response = await HttpService.post('/expert/get/consultations', {
      consultant_id: expertId,
    });
    return {
      success: true,
      data: get(response, 'data.data', []),
    };
  } catch (error: unknown) {
    console.error('Error fetching consultations:', error);
    return {
      success: false,
      message: 'Failed to fetch consultations',
    };
  }
};

const updateConsultationStatus = async (data: {
  consultationId: number;
  status: number;
  notes: string;
}) => {
  try {
    const response = await HttpService.post('/expert/update-status', data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error('Error updating consultation status:', error);
    throw error;
  }
};

const ExpertService = {
  getGoogleAuthUrl,
  setAvailability,
  getExpertSlots,
  toggleDayOff,
  updateDaySlots,
  getConsultations,
  updateConsultationStatus,
};

export default ExpertService;
