import HttpService from '../services/HttpService';
import type { ILanguage } from './language.interface';

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

const LanguageService = {
  fetchLanguageList,
};

export default LanguageService;
