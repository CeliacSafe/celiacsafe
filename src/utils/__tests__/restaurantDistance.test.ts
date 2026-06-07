import type { Restaurant } from '../../types/Restaurant';
import { distanceKm, sortRestaurantsByDistance } from '../restaurantDistance';

const base: Restaurant = {
  id: 'a',
  name: 'A',
  country_code: 'ES',
  region_code: 'ES-IB',
  region_name: 'Baleares',
  city: 'Palma',
  verification_status: 'verified',
  latitude: 39.57,
  longitude: 2.65,
};

describe('restaurantDistance', () => {
  it('computes distance in km', () => {
    expect(distanceKm(39.57, 2.65, 39.58, 2.66)).toBeGreaterThan(0);
    expect(distanceKm(39.57, 2.65, 39.57, 2.65)).toBe(0);
  });

  it('sorts by distance with missing coords last', () => {
    const sorted = sortRestaurantsByDistance(
      [
        { ...base, id: 'far', latitude: 41.0, longitude: 1.0 },
        { ...base, id: 'near', latitude: 39.571, longitude: 2.651 },
        { ...base, id: 'none', latitude: undefined, longitude: undefined },
      ],
      39.57,
      2.65,
    );
    const ids = sorted.map((r) => r.id);
    expect(ids.indexOf('near')).toBeLessThan(ids.indexOf('far'));
    expect(ids.indexOf('none')).toBe(2);
  });

  it('sorts premium partners first within the same city', () => {
    const sorted = sortRestaurantsByDistance(
      [
        { ...base, id: 'far-premium', latitude: 41.0, longitude: 1.0, is_premium_partner: true },
        { ...base, id: 'near', latitude: 39.571, longitude: 2.651 },
      ],
      39.57,
      2.65,
    );
    expect(sorted[0].id).toBe('far-premium');
  });
});
