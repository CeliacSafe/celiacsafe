import { useLanguageStore } from '../store/languageStore';

export function formatDate(isoString: string, language: 'es' | 'en' | 'de'): string {
  if (!isoString) {
    return '';
  }
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return isoString;
    }
    const localeMap = { es: 'es-ES', en: 'en-GB', de: 'de-DE' } as const;
    return date.toLocaleDateString(localeMap[language], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function useFormatDate() {
  const language = useLanguageStore((state) => state.language);
  return (iso: string) => formatDate(iso, language);
}
