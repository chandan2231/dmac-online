export const QUERY_KEYS_FOR_LANGUAGE = {
  GET_LANGUAGE_LIST: 'languageList',
} as const;

export interface ILanguage {
  id: number;
  language: string;
  code: LanguageCode;
}

export type LanguageCode = 'en' | 'hi' | 'es' | 'ar';

export interface ILanguageConstants {
  agree: string;
  agree_start: string;
  cancel: string;
  done: string;
  start: string;
}

export interface IChangeLanguagePayload {
  language: number;
  id: number;
}

export interface IUpdateLanguageDetails {
  language: string;
  languageCode: LanguageCode;
}
