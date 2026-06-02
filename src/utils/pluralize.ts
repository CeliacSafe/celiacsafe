interface PluralForms {
  one: string;
  other: string;
}

type Lang = 'es' | 'en' | 'de';

const RESULT_FORMS: Record<Lang, PluralForms> = {
  es: {
    one: '1 resultado encontrado',
    other: '{count} resultados encontrados',
  },
  en: {
    one: '1 result found',
    other: '{count} results found',
  },
  de: {
    one: '1 Ergebnis gefunden',
    other: '{count} Ergebnisse gefunden',
  },
};

export function formatResultCount(count: number, lang: Lang = 'es'): string {
  const forms = RESULT_FORMS[lang];
  const template = count === 1 ? forms.one : forms.other;
  return template.replace('{count}', String(count));
}
