import HttpService from '../services/HttpService';
import type {
  IChangeLanguagePayload,
  ILanguage,
  ILanguageConstants,
} from './language.interface';

const getPayload = (USER_TYPE?: string | null) => {
  if (!USER_TYPE) return '';

  if (USER_TYPE === 'USER') {
    return {
      patient_show: 1,
    };
  }

  if (USER_TYPE === 'THERAPIST') {
    return {
      therapist_show: 1,
    };
  }

  if (USER_TYPE === 'EXPERT') {
    return {
      expert_show: 1,
    };
  }

  return '';
};

const fetchLanguageList = async ({
  USER_TYPE,
}: {
  USER_TYPE?: string | null;
}) => {
  const payload = getPayload(USER_TYPE);
  try {
    const response = await HttpService.post<ILanguage[]>(
      '/language/language-list',
      {
        payload,
      }
    );
    const { data } = response;
    return {
      isSuccess: true,
      data: data,
    };
  } catch (error: unknown) {
    console.error('Error fetching language list:', error);
    return {
      isSuccess: false,
      message: 'Failed to fetch language list',
      data: [],
    };
  }
};

const fetchLanguageContants = async (languageCode: string) => {
  try {
    const response = await HttpService.get<ILanguageConstants>(
      `/questionar/ui/texts`,
      {
        params: { lang: languageCode },
      }
    );
    const { data } = response;
    return {
      isSuccess: true,
      data: data,
    };
  } catch (error: unknown) {
    console.error('Error fetching language constants:', error);
    return {
      isSuccess: false,
      message: 'Failed to fetch language constants',
      data: {},
    };
  }
};

const changeLanguage = async ({
  ...changeLanguagePayload
}: IChangeLanguagePayload) => {
  try {
    const response = await HttpService.post('/language/language-update', {
      ...changeLanguagePayload,
    });
    return {
      isSuccess: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error('Error changing language:', error);
    return {
      isSuccess: false,
      message: 'Failed to change language',
      data: null,
    };
  }
};

const LanguageService = {
  fetchLanguageList,
  fetchLanguageContants,
  changeLanguage,
};

export default LanguageService;
