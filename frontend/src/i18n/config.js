import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from "./tanslations/en.json";
import pa from "./tanslations/pa.json";

i18n.use(initReactI18next).init({
  lng: 'en', // Set a default language
  fallbackLng: 'en',
  resources: {
    en: {
      translation: en
    },
    pa: {
      translation: pa
    }
  },
  ns: ['translation'],
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false // React already protects against XSS
  }
});

export default i18n;