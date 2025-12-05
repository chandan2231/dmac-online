import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // ✅ NEW

i18next
  .use(LanguageDetector) // ✅ detect language from localStorage/cookies/etc
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en', // default if no match
    resources: {}, // Start with empty resources
    interpolation: {
      escapeValue: false, // react already protects from XSS
    },
  });
