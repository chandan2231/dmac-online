export const QUERY_KEYS_FOR_LANGUAGE = {
  GET_LANGUAGE_LIST: 'languageList',
} as const;

export interface ILanguage {
  id: number;
  language: string;
}
