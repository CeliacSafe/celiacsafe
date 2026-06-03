export interface LegalSection {
  title: string;
  body: string;
}

function isLegalSection(value: unknown): value is LegalSection {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const section = value as LegalSection;
  return typeof section.title === 'string' && typeof section.body === 'string';
}

/** Liest ein i18n-Abschnitts-Array (privacy.sections, impressum.sections). */
export function parseLegalSections(value: unknown): LegalSection[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isLegalSection);
}
