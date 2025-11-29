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

const TherapistService = {
  getGoogleAuthUrl,
  setAvailability,
  getTherapistSlots,
  toggleDayOff,
  updateDaySlots,
};

export default TherapistService;
