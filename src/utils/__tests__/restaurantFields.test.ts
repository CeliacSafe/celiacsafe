import type { Restaurant } from '../../types/Restaurant';
import {
  getActiveAllergenKeys,
  getRestaurantCategory,
  isRestaurantCertified,
  resolveRestaurantAllergens,
} from '../restaurantFields';

function createRestaurant(overrides: Partial<Restaurant>): Restaurant {
  return {
    id: 'id',
    name: 'Restaurant',
    country_code: 'ES',
    region_code: 'ES-MD',
    region_name: 'Comunidad de Madrid',
    city: 'Madrid',
    verification_status: 'verified',
    ...overrides,
  };
}

describe('isRestaurantCertified', () => {
  it('nutzt is_certified wenn gesetzt', () => {
    expect(isRestaurantCertified(createRestaurant({ is_certified: true }))).toBe(true);
    expect(
      isRestaurantCertified(createRestaurant({ is_certified: false, face_program: true }))
    ).toBe(false);
  });

  it('faellt auf face_program und aoecs_certified zurueck', () => {
    expect(isRestaurantCertified(createRestaurant({ face_program: true }))).toBe(true);
    expect(isRestaurantCertified(createRestaurant({ aoecs_certified: true }))).toBe(true);
    expect(isRestaurantCertified(createRestaurant({}))).toBe(false);
  });
});

describe('getRestaurantCategory', () => {
  it('nutzt explizite category', () => {
    expect(getRestaurantCategory(createRestaurant({ category: 'pizza' }))).toBe('pizza');
  });

  it('leitet aus venue_type ab', () => {
    expect(getRestaurantCategory(createRestaurant({ venue_type: 'pizzeria' }))).toBe('pizza');
    expect(getRestaurantCategory(createRestaurant({ venue_type: 'bakery' }))).toBe('bakery');
    expect(getRestaurantCategory(createRestaurant({ venue_type: 'fast_food' }))).toBe('fastfood');
  });
});

describe('resolveRestaurantAllergens', () => {
  it('respektiert explizite allergens', () => {
    expect(
      resolveRestaurantAllergens(
        createRestaurant({
          allergens: { sin_lactosa: true, vegan: false, sin_trigo: false },
        })
      )
    ).toEqual({
      sin_lactosa: true,
      vegan: false,
      sin_trigo: false,
    });
  });

  it('leitet vegan aus cuisine_types ab', () => {
    expect(
      resolveRestaurantAllergens(
        createRestaurant({ cuisine_types: ['Vegan bakery'] })
      ).vegan
    ).toBe(true);
  });

  it('setzt sin_trigo fuer verified Lokale standardmaessig', () => {
    expect(
      resolveRestaurantAllergens(createRestaurant({ verification_status: 'verified' })).sin_trigo
    ).toBe(true);
  });
});

describe('getActiveAllergenKeys', () => {
  it('liefert nur aktive Flags', () => {
    const keys = getActiveAllergenKeys(
      createRestaurant({
        verification_status: 'verified',
        allergens: { sin_lactosa: true, vegan: false },
      })
    );
    expect(keys).toContain('sin_lactosa');
    expect(keys).toContain('sin_trigo');
    expect(keys).not.toContain('vegan');
  });
});
