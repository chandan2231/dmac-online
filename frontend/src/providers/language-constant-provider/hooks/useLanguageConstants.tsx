import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import type { ILanguageConstants } from '../../../i18n/language.interface';
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from '../../../utils/functions';
import { LOCAL_STORAGE_KEYS } from '../../../utils/constants';
import LanguageService from '../../../i18n/language.service';

export const useLanguageConstants = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [languageConstants, setLanguageConstants] = useState<
    ILanguageConstants | Record<string, string>
  >({});

  useEffect(() => {
    const fetchAndStoreLanguage = async () => {
      if (!isAuthenticated || !user?.languageCode) {
        setLanguageConstants({});
        return;
      }

      try {
        const storedConstants = getLocalStorageItem(
          LOCAL_STORAGE_KEYS.LANGUAGE_CONSTANTS
        );
        const parsedConstants = storedConstants
          ? JSON.parse(storedConstants)
          : null;

        if (parsedConstants) {
          setLanguageConstants(parsedConstants);
          return;
        }

        const langCode = user.languageCode ?? 'en';
        const { data } = await LanguageService.fetchLanguageContants(langCode);

        setLanguageConstants(data);
        setLocalStorageItem(
          LOCAL_STORAGE_KEYS.LANGUAGE_CONSTANTS,
          JSON.stringify(data)
        );
      } catch (error) {
        console.error('Error fetching language constants:', error);
        setLanguageConstants({});
      }
    };

    fetchAndStoreLanguage();
  }, [isAuthenticated, user]);

  return { languageConstants };
};
