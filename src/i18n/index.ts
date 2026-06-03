import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';

/** Unterstützte App-Sprachen (UI + Daten-Fallback). */
export type SupportedLanguage = 'es' | 'en' | 'de';

/**
 * Erkennt die bevorzugte Gerätesprache und mappt auf es/en/de.
 * Unbekannte Sprachen → Englisch (internationale Touristen).
 */
export function getDeviceLanguage(): SupportedLanguage {
  const locales = Localization.getLocales();
  if (locales.length === 0) {
    return 'es';
  }

  const code = locales[0].languageCode?.toLowerCase() ?? 'es';
  if (code === 'de') {
    return 'de';
  }
  if (code === 'es') {
    return 'es';
  }
  return 'en';
}

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
