import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import {
  getDeviceLanguage,
  type SupportedLanguage,
} from './resolveDeviceLanguage';

/** Unterstützte App-Sprachen (UI + Daten-Fallback). */
export type { SupportedLanguage };
export { getBrowserLanguageCodes, getDeviceLanguage, resolveSupportedLanguage } from './resolveDeviceLanguage';

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    de: { translation: de },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
