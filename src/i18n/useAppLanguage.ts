import { useTranslation } from 'react-i18next';

import type { AppLanguage } from './getLocalizedName';

/** Aktuelle App-Sprache aus i18n (nach Store-Hydration synchron). */
export function useAppLanguage(): AppLanguage {
  const { i18n } = useTranslation();
  const lng = i18n.language;
  if (lng === 'de' || lng === 'en' || lng === 'es') {
    return lng;
  }
  return 'es';
}
