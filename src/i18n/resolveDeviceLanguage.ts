import * as Localization from 'expo-localization';
import { Platform } from 'react-native';

export type SupportedLanguage = 'es' | 'en' | 'de';

/** Normalisiert BCP-47-Tags (z. B. de-DE) auf Sprachcode. */
export function normalizeLanguageTag(tag: string): string {
  return tag.trim().toLowerCase().split(/[-_]/)[0] ?? '';
}

/** Erste unterstützte Sprache aus einer Praeferenzliste (Browser oder Geraet). */
export function resolveSupportedLanguage(codes: readonly string[]): SupportedLanguage | null {
  for (const raw of codes) {
    const code = normalizeLanguageTag(raw);
    if (code === 'de' || code === 'es' || code === 'en') {
      return code;
    }
  }
  return null;
}

/** Bevorzugte Sprachen des Browsers (navigator.languages). */
export function getBrowserLanguageCodes(): string[] {
  if (typeof navigator === 'undefined') {
    return [];
  }

  const fromList = navigator.languages?.length
    ? [...navigator.languages]
    : navigator.language
      ? [navigator.language]
      : [];

  return fromList.map(String).filter((code) => code.trim().length > 0);
}

function getExpoLanguageCodes(): string[] {
  return Localization.getLocales()
    .map((locale) => locale.languageCode)
    .filter((code): code is string => Boolean(code));
}

/**
 * Ermittelt die App-Startsprache aus Browser- bzw. Geraetepraeferenzen.
 * Unbekannte Sprachen → Englisch (internationale Touristen).
 */
export function getDeviceLanguage(): SupportedLanguage {
  const browserCodes = Platform.OS === 'web' ? getBrowserLanguageCodes() : [];
  const fromBrowser = browserCodes.length > 0 ? resolveSupportedLanguage(browserCodes) : null;
  if (fromBrowser) {
    return fromBrowser;
  }

  const expoCodes = getExpoLanguageCodes();
  const fromExpo = expoCodes.length > 0 ? resolveSupportedLanguage(expoCodes) : null;
  if (fromExpo) {
    return fromExpo;
  }

  return Platform.OS === 'web' ? 'en' : 'es';
}
