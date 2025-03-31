import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';

export const LANGUAGE_KEY = 'APP_LANGUAGE';

const languageDetector = {
  type: 'languageDetector',
  async: false, // synchronous for web
  detect: () => {
    const storedLang = localStorage.getItem(LANGUAGE_KEY);
    return storedLang || 'en';
  },
  init: () => {},
  cacheUserLanguage: (lng) => {
    localStorage.setItem(LANGUAGE_KEY, lng);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en', // default language
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      te: { translation: te },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
