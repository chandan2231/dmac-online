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
  path: ROUTES | null,
  allowedRoutes: IAllowedRoutes[] | null
): ROUTES[] => {
  if (!allowedRoutes || !path) {
    return [];
  }

  const visited = new Set<ROUTES>();

  const collect = (parentPath: ROUTES): ROUTES[] => {
    if (visited.has(parentPath)) {
      return [];
    }

    visited.add(parentPath);

    const children = allowedRoutes.filter(
      route => route.isAChildOf === parentPath
    );
    const directPaths = children.map(route => route.path);
    const descendantPaths = children.flatMap(route => collect(route.path));

    return [...directPaths, ...descendantPaths];
  };

  return collect(path);
};

const getSidebarOptions = (allowedRoutes: IAllowedRoutes[] | null) => {
  if (!allowedRoutes) {
    return [];
  }

  type SidebarOption = {
    key: string;
    path: ROUTES | null;
    title: string | null;
    icon: IAllowedRoutes['sideBarIcon'] | IAllowedRoutes['sideBarGroupIcon'];
    nestedRoutes: ROUTES[];
    children: SidebarOption[];
  };

  const visibleRoutes = allowedRoutes.filter(route => route.showInSidebar);
  const visiblePaths = new Set<ROUTES>(visibleRoutes.map(route => route.path));

  const childrenByParent = new Map<ROUTES, IAllowedRoutes[]>();
  for (const route of visibleRoutes) {
    const parentPath = route.isAChildOf;
    if (!parentPath) continue;
    if (!visiblePaths.has(parentPath)) continue;

    const current = childrenByParent.get(parentPath) ?? [];
    current.push(route);
    childrenByParent.set(parentPath, current);
  }

  const topLevelRoutes = visibleRoutes.filter(route => {
    const parentPath = route.isAChildOf;
    if (!parentPath) return true;
    return !visiblePaths.has(parentPath);
  });

  // Enforce a small, predictable ordering for key patient pages.
  // Order required: Consent, Auth With Google, Products, Questioners.
  const preferredTopLevelOrder = new Map<ROUTES, number>([
    [ROUTES.CONSENT, 0],
    [ROUTES.AUTH_WITH_GOOGLE, 1],
    [ROUTES.PATIENT_PRODUCTS, 2],
    [ROUTES.QUESTIONERS, 3],
  ]);

  const sortedTopLevelRoutes = topLevelRoutes
    .map((route, index) => ({ route, index }))
    .sort((a, b) => {
      const aOrder = preferredTopLevelOrder.get(a.route.path) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = preferredTopLevelOrder.get(b.route.path) ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.index - b.index;
    })
    .map(({ route }) => route);

  const toSidebarOption = (route: IAllowedRoutes): SidebarOption => {
    const routePath = route.path;
    const children: SidebarOption[] = (
      childrenByParent.get(routePath) ?? []
    ).map(toSidebarOption);

    return {
      key: routePath,
      path: routePath,
      title: route.sideBarTitle,
      icon: route.sideBarIcon,
      nestedRoutes: getNestedRoutes(routePath, allowedRoutes),
      children,
    };
  };

  // Sidebar grouping (accordion) based on route metadata.
  // Only groups top-level routes; nested routes still use isAChildOf.
  const groupedOptions: SidebarOption[] = [];
  const groups = new Map<
    string,
    { option: SidebarOption; routes: IAllowedRoutes[]; nestedSet: Set<ROUTES> }
  >();

  for (const route of sortedTopLevelRoutes) {
    const groupTitle = route.sideBarGroupTitle ?? null;

    if (!groupTitle) {
      groupedOptions.push(toSidebarOption(route));
      continue;
    }

    let group = groups.get(groupTitle);
    if (!group) {
      const groupOption: SidebarOption = {
        key: `group:${groupTitle}`,
        path: null,
        title: groupTitle,
        icon: route.sideBarGroupIcon ?? route.sideBarIcon,
        nestedRoutes: [],
        children: [],
      };
      group = { option: groupOption, routes: [], nestedSet: new Set() };
      groups.set(groupTitle, group);
      groupedOptions.push(groupOption);
    }

    group.routes.push(route);
  }

  for (const group of groups.values()) {
    const children = group.routes.map(toSidebarOption);
    group.option.children = children;

    for (const child of children) {
      if (child.path) group.nestedSet.add(child.path);
      for (const nestedPath of child.nestedRoutes) {
        group.nestedSet.add(nestedPath);
      }
    }

    group.option.nestedRoutes = Array.from(group.nestedSet);
  }

  return groupedOptions;
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
  if (role === 'COUNTRY_ADMIN') {
    return ROUTES.COUNTRY_ADMIN_DASHBOARD;
  }
  if (role === 'USER') {
    return ROUTES.CONSENT;
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

const getIpAddress = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return get(data, ['ip'], null);
  } catch (error) {
    console.error('Error getting IP address', error);
    return null;
  }
};

const getUserEnvironmentInfo = async () => {
  const { lat, long } = await getGeolocation();
  const ipAddress = await getIpAddress();
  const networkInfo = getNetworkInfo();
  const deviceInfo = getDeviceInfo();
  const osDetails = navigator.platform;

  const userEnvironmentInfo = {
    lat,
    long,
    networkInfo,
    deviceInfo,
    osDetails,
    ipAddress,
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
