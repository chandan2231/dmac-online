import { get } from 'lodash';
import { type IUser } from '../features/auth/auth.interface';
import {
  LOCAL_STORAGE_KEYS,
  ROLES_ALLOWED_TO_CHANGE_LANGUAGE,
} from './constants';
import type { ILanguage, ILanguageConstants } from '../i18n/language.interface';
import type { IOption } from '../components/select';
import { ROUTES, type IAllowedRoutes } from '../router/router';

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
  allowedRoutes: IAllowedRoutes[] | null
) => {
  if (!allowedRoutes) {
    return [];
  }

  return allowedRoutes
    .filter(route => get(route, ['isAChildOf'], null) === path)
    .map(route => get(route, ['path'], null));
};

const getSidebarOptions = (allowedRoutes: IAllowedRoutes[] | null) => {
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

const canWeShowChangeLanguageOption = (user: IUser | null) => {
  const userRole = get(user, ['role'], '');
  return ROLES_ALLOWED_TO_CHANGE_LANGUAGE.includes(userRole);
};

const navigateUserTo = (user: IUser | null) => {
  const role = get(user, ['role'], 'USER');
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return ROUTES.ADMIN_DASHBOARD;
  }
  return ROUTES.HOME;
};

const getGeolocation = (): Promise<{
  lat: number | null;
  long: number | null;
}> => {
  return new Promise(resolve => {
    if (!('geolocation' in navigator)) {
      resolve({ lat: null, long: null });
    } else {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
        },
        error => {
          console.error('Error getting location', error);
          resolve({ lat: null, long: null });
        }
      );
    }
  });
};

const getNetworkInfo = () => {
  const nav = navigator as NavigatorWithExtensions;
  const connection =
    nav.connection || nav.mozConnection || nav.webkitConnection;

  return connection
    ? {
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        downlink: connection.downlink,
        saveData: connection.saveData,
      }
    : {};
};

const getDeviceInfo = () => {
  const nav = navigator as NavigatorWithExtensions;
  return {
    userAgent: nav.userAgent,
    platform: nav.platform,
    vendor: nav.vendor,
    language: nav.language,
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
  };
};

const getUserEnvironmentInfo = async () => {
  const { lat, long } = await getGeolocation();
  const networkInfo = getNetworkInfo();
  const deviceInfo = getDeviceInfo();
  const osDetails = navigator.platform;

  const userEnvironmentInfo = {
    lat,
    long,
    networkInfo,
    deviceInfo,
    osDetails,
  };

  return { userEnvironmentInfo };
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
  canWeShowChangeLanguageOption,
  navigateUserTo,
  getUserEnvironmentInfo,
};
