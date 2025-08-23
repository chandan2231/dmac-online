import HttpService from '../services/HttpService';
import type {
  IChangeLanguagePayload,
  ILanguage,
  ILanguageConstants,
} from './language.interface';

const fetchLanguageList = async () => {
  try {
    const response = await HttpService.get<ILanguage[]>(
      '/language/language-list'
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
