import { hasSearchOnlyFilters } from '../filterCriteria';

describe('filterCriteria', () => {
  const base = {
    dietVegan: false,
    dietVegetarian: false,
    dietLactoseFree: false,
    minRating: 'all' as const,
    categoryTab: 'all' as const,
  };

  it('erkennt keine Suche-only Filter im Ausgangszustand', () => {
    expect(hasSearchOnlyFilters(base)).toBe(false);
  });

  it('erkennt Vegan-Chip als Suche-only', () => {
    expect(hasSearchOnlyFilters({ ...base, dietVegan: true })).toBe(true);
  });

  it('erkennt Kategorie-Tab als Suche-only', () => {
    expect(hasSearchOnlyFilters({ ...base, categoryTab: 'community' })).toBe(true);
  });

  it('erkennt Mindestbewertung als Suche-only', () => {
    expect(hasSearchOnlyFilters({ ...base, minRating: '4' })).toBe(true);
  });
});
