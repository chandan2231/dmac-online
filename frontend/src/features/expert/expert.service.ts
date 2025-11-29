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

const ExpertService = {
  getGoogleAuthUrl,
  setAvailability,
  getExpertSlots,
};

export default ExpertService;
