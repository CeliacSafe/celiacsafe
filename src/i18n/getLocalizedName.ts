export type AppLanguage = 'es' | 'en' | 'de';

export type LocalizedRecord = Record<AppLanguage, string>;

export function getLocalizedName<T extends string>(
  names: Record<T, LocalizedRecord>,
  code: T,
  language: AppLanguage
): string {
  const entry = names[code];
  if (!entry) {
    return code;
  }
  return entry[language] ?? entry.es;
}
