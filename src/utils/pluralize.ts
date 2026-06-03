import i18n from '../i18n';

export function formatResultCount(count: number): string {
  return i18n.t('search.results_found', { count });
}
