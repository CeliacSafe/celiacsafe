import {
  getBrowserLanguageCodes,
  normalizeLanguageTag,
  resolveSupportedLanguage,
} from '../resolveDeviceLanguage';

describe('normalizeLanguageTag', () => {
  it('normalisiert BCP-47-Tags', () => {
    expect(normalizeLanguageTag('de-DE')).toBe('de');
    expect(normalizeLanguageTag('en-US')).toBe('en');
    expect(normalizeLanguageTag('es_ES')).toBe('es');
  });
});

describe('resolveSupportedLanguage', () => {
  it('nutzt die erste passende Browser-Sprache', () => {
    expect(resolveSupportedLanguage(['fr-FR', 'de-DE', 'en-US'])).toBe('de');
    expect(resolveSupportedLanguage(['en-US', 'de-DE'])).toBe('en');
    expect(resolveSupportedLanguage(['es-ES'])).toBe('es');
  });

  it('gibt null fuer unbekannte Sprachen zurueck', () => {
    expect(resolveSupportedLanguage(['fr-FR', 'it-IT'])).toBeNull();
  });
});

describe('getBrowserLanguageCodes', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
  });

  it('liest navigator.languages', () => {
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        languages: ['de-DE', 'en-US'],
        language: 'de-DE',
      },
    });

    expect(getBrowserLanguageCodes()).toEqual(['de-DE', 'en-US']);
  });
});
