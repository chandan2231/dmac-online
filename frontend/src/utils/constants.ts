import type { IOption } from '../components/select';

export const LOCAL_STORAGE_KEYS = {
  SIDEBAR_OPEN: 'sidebarOpen',
};

export const DRAWER_WIDTH = 240;
export const MINI_DRAWER_WIDTH = 70;

export const ADMIN_CREDENTIALS = {
  email: 'ADMIN_CREDENTIALS@gmail.com',
  password: 'ADMIN_CREDENTIALS',
};

export const LANGUAGES_LIST: Record<string, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇺🇸' },
  hi: { label: 'हिन्दी', flag: '🇮🇳' },
  es: { label: 'Español', flag: '🇪🇸' },
  zh: { label: '中文', flag: '🇨🇳' },
  // Add more languages as needed
};

export const COUNTRIES_LIST: IOption[] = [
  { value: 'US', label: 'United States' },
  { value: 'IN', label: 'India' },
  { value: 'ES', label: 'Spain' },
  { value: 'CN', label: 'China' },
  // Add more countries as needed
];
