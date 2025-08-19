export const QUERY_KEYS_FOR_LANGUAGE = {
  GET_LANGUAGE_LIST: 'languageList',
} as const;

export interface ILanguage {
  id: number;
  language: string;
}

export type LanguageCode = 'en' | 'hi' | 'es' | 'zh';

export interface ILanguageConstants {
  agree: string;
  agree_start: string;
  cancel: string;
  done: string;
  start: string;
}
