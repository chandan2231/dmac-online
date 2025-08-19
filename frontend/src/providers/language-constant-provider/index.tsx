import { createContext, useContext, useEffect, useState } from 'react';
import type { ILanguageConstants } from '../../i18n/language.interface';
import type { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { LOCAL_STORAGE_KEYS } from '../../utils/constants';
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from '../../utils/functions';
import LanguageService from '../../i18n/language.service';

interface ILanguageContextProps {
  languageConstants: ILanguageConstants | Record<string, string>;
}

const LanguageConstantContext = createContext<
  ILanguageContextProps | undefined
>(undefined);

export const useLanguageConstantContext = () => {
  const context = useContext(LanguageConstantContext);
  if (!context) {
    throw new Error(
      'useLanguageConstantContext must be used within LanguageConstantProvider'
    );
  }
  return context;
};

export const LanguageConstantProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
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

  return (
    <LanguageConstantContext.Provider value={{ languageConstants }}>
      {children}
    </LanguageConstantContext.Provider>
  );
};
