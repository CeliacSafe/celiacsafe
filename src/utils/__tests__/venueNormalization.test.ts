import {
  cuisineMatchesDiet,
  normalizeVenueTypes,
  primaryVenueType,
} from '../venueNormalization';

describe('normalizeVenueTypes', () => {
  it('maps Title-Case English values to canonical codes', () => {
    expect(normalizeVenueTypes('Restaurant')).toEqual(['restaurant']);
    expect(normalizeVenueTypes('Bakery')).toEqual(['bakery']);
    expect(normalizeVenueTypes('Café')).toEqual(['cafe']);
    expect(normalizeVenueTypes('Pastry shop')).toEqual(['pastry_shop']);
  });

  it('splits compound venue types into multiple codes', () => {
    expect(normalizeVenueTypes('Bakery / Café')).toEqual(['bakery', 'cafe']);
    expect(normalizeVenueTypes('Café / Bakery / Pastry shop')).toEqual([
      'cafe',
      'bakery',
      'pastry_shop',
    ]);
  });

  it('maps Spanish/regional synonyms', () => {
    expect(normalizeVenueTypes('Obrador / Bakery')).toEqual(['bakery']);
    expect(normalizeVenueTypes('Restaurant / Sidrería')).toEqual([
      'restaurant',
      'bar_tapas',
    ]);
  });

  it('returns empty for unknown or missing values', () => {
    expect(normalizeVenueTypes(undefined)).toEqual([]);
    expect(normalizeVenueTypes('')).toEqual([]);
    expect(normalizeVenueTypes('Juice bar')).toEqual([]);
  });

  it('accepts already-canonical codes', () => {
    expect(normalizeVenueTypes('bakery')).toEqual(['bakery']);
    expect(primaryVenueType('pastry_shop')).toBe('pastry_shop');
  });
});

describe('cuisineMatchesDiet', () => {
  it('detects vegan from English and Spanish tags', () => {
    expect(cuisineMatchesDiet(['Vegan'], 'vegan')).toBe(true);
    expect(cuisineMatchesDiet(['Vegan bakery'], 'vegan')).toBe(true);
    expect(cuisineMatchesDiet(['Vegana'], 'vegan')).toBe(true);
  });

  it('detects vegetarian without matching vegan-only tags', () => {
    expect(cuisineMatchesDiet(['Vegetarian'], 'vegetarian')).toBe(true);
    expect(cuisineMatchesDiet(['Vegetariana'], 'vegetarian')).toBe(true);
    expect(cuisineMatchesDiet(['Vegan'], 'vegetarian')).toBe(false);
  });

  it('returns false for empty or unrelated cuisines', () => {
    expect(cuisineMatchesDiet(undefined, 'vegan')).toBe(false);
    expect(cuisineMatchesDiet(['Mediterranean', 'Tapas'], 'vegan')).toBe(false);
  });
});
