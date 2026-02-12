import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import type { ILanguageConstants } from '../../../i18n/language.interface';
import {
  canWeShowChangeLanguageOption,
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
      // Always try to hydrate from localStorage first (supports screening flow
      // where the user isn't authenticated but we still want UI texts).
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
      } catch {
        // ignore parse errors and fall back to fetching (when eligible)
      }

      if (
        !isAuthenticated ||
        !user?.languageCode ||
        !canWeShowChangeLanguageOption(user)
      ) {
        setLanguageConstants({});
        return;
      }

      try {
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
