export type LanguageCode = 'en' | 'hi' | 'es' | 'zh';

export interface ILanguageConstants {
  [key in Language]: {
    cancel: string;
    continue: string;
  };
}
