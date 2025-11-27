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

const ExpertService = {
  getGoogleAuthUrl,
};

export default ExpertService;
