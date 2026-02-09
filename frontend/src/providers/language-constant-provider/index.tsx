import { createContext, useContext } from 'react';
import type { ILanguageConstants } from '../../i18n/language.interface';
import { useLanguageConstants } from './hooks/useLanguageConstants';

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
  const { languageConstants } = useLanguageConstants();

  return (
    <LanguageConstantContext.Provider value={{ languageConstants }}>
      {children}
    </LanguageConstantContext.Provider>
  );
};
