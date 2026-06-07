import type { Restaurant } from '../../types/Restaurant';
import { compareWithPremiumInCity, sortRestaurantsWithPremiumInCity } from '../restaurantSort';

const base: Restaurant = {
  id: 'a',
  name: 'A',
  country_code: 'ES',
  region_code: 'ES-MD',
  region_name: 'Madrid',
  city: 'Madrid',
  verification_status: 'verified',
};

describe('restaurantSort', () => {
  it('sortiert Premiumpartner zuerst innerhalb derselben Stadt', () => {
    const restaurants: Restaurant[] = [
      { ...base, id: '1', name: 'Zeta', city: 'Madrid' },
      { ...base, id: '2', name: 'Alpha Premium', city: 'Madrid', is_premium_partner: true },
      { ...base, id: '3', name: 'Beta', city: 'Madrid' },
    ];

    const sorted = sortRestaurantsWithPremiumInCity(restaurants, (a, b) =>
      a.name.localeCompare(b.name, 'es')
    );

    expect(sorted.map((r) => r.id)).toEqual(['2', '3', '1']);
  });

  it('vergleicht Städte case-insensitive', () => {
    const a: Restaurant = { ...base, id: 'a', city: 'Madrid', is_premium_partner: true };
    const b: Restaurant = { ...base, id: 'b', city: 'madrid' };

    expect(compareWithPremiumInCity(a, b, () => 0)).toBeLessThan(0);
    expect(compareWithPremiumInCity(b, a, () => 0)).toBeGreaterThan(0);
  });

  it('beeinflusst nicht die Reihenfolge zwischen verschiedenen Städten', () => {
    const madrid: Restaurant = { ...base, id: 'm', city: 'Madrid' };
    const barcelonaPremium: Restaurant = {
      ...base,
      id: 'b',
      city: 'Barcelona',
      is_premium_partner: true,
    };

    expect(compareWithPremiumInCity(madrid, barcelonaPremium, () => -1)).toBe(-1);
    expect(compareWithPremiumInCity(barcelonaPremium, madrid, () => 1)).toBe(1);
  });
});
