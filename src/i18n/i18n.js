import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';

export const LANGUAGE_KEY = 'APP_LANGUAGE';

// Get the stored language from localStorage; default to 'en' if not set
const storedLanguage = localStorage.getItem(LANGUAGE_KEY) || 'en';

i18n
  // You can remove your custom languageDetector if you’re handling detection manually.
  .use(initReactI18next)
  .init({
    lng: storedLanguage, // Use the stored language here
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
