import { get } from 'lodash';
import type { IUserRoute } from '../features/auth/auth.interface';
import { LOCAL_STORAGE_KEYS } from './constants';
import type { ILanguage, ILanguageConstants } from '../i18n/language.interface';
import type { IOption } from '../components/select';

const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1; // Months are zero-indexed in JavaScript
};

const getCurrentDay = (): number => {
  return new Date().getDate();
};

const getCurrentDate = (): string => {
  const year = getCurrentYear();
  const month = String(getCurrentMonth()).padStart(2, '0');
  const day = String(getCurrentDay()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const purgeLocalStorage = (): void => {
  localStorage.clear();
};

const getLocalStorageItem = (
  key: (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS]
): string | null => {
  return localStorage.getItem(key);
};

const setLocalStorageItem = (
  key: (typeof LOCAL_STORAGE_KEYS)[keyof typeof LOCAL_STORAGE_KEYS],
  value: string
): void => {
  localStorage.setItem(key, value);
};

const getNestedRoutes = (
  path: string | null,
  allowedRoutes: IUserRoute[] | null
) => {
  if (!allowedRoutes) {
    return [];
  }

  return allowedRoutes
    .filter(route => get(route, ['isAChildOf'], null) === path)
    .map(route => get(route, ['path'], null));
};

const getSidebarOptions = (allowedRoutes: IUserRoute[] | null) => {
  if (!allowedRoutes) {
    return [];
  }

  return allowedRoutes
    .filter(route => route.showInSidebar)
    .map(route => ({
      path: get(route, ['path'], null),
      title: get(route, ['sideBarTitle']),
      icon: get(route, ['sideBarIcon']),
      nestedRoutes: getNestedRoutes(get(route, ['path'], null), allowedRoutes),
    }));
};

const convertLanguagesListToOptions = (
  languages: ILanguage[] | []
): IOption[] => {
  return languages.map(language => ({
    label: get(language, ['language'], ''),
    value: String(get(language, ['id'], '')),
  }));
};

const getLanguageText = (
  languageConstants: ILanguageConstants | Record<string, string>,
  text: string
) => {
  const languageText = get(languageConstants, [text], '');
  return languageText || text;
};

export {
  getCurrentYear,
  getCurrentMonth,
  getCurrentDay,
  getCurrentDate,
  purgeLocalStorage,
  getLocalStorageItem,
  setLocalStorageItem,
  getSidebarOptions,
  convertLanguagesListToOptions,
  getLanguageText,
};
