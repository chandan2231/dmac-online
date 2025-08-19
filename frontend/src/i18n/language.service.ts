import HttpService from '../services/HttpService';
import type { ILanguage, ILanguageConstants } from './language.interface';

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

const LanguageService = {
  fetchLanguageList,
  fetchLanguageContants,
};

export default LanguageService;
