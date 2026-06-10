import type { Restaurant } from '../../types/Restaurant';
import { getMapPinCategory, getMapPinStyle } from '../mapPinStyle';

function restaurant(overrides: Partial<Restaurant>): Restaurant {
  return {
    id: 'id',
    name: 'Test',
    country_code: 'ES',
    region_code: 'ES-MD',
    region_name: 'Madrid',
    city: 'Madrid',
    verification_status: 'verified',
    ...overrides,
  };
}

describe('mapPinStyle', () => {
  it('mappt Bäckereien und Cafés auf gelb', () => {
    expect(getMapPinCategory(restaurant({ venue_type: 'bakery' }))).toBe('cafe_bakery');
    expect(getMapPinCategory(restaurant({ venue_type: 'cafe' }))).toBe('cafe_bakery');
    expect(getMapPinStyle(restaurant({ venue_type: 'cafe' })).fill).toBe('#E8C547');
  });

  it('mappt Restaurants auf grün', () => {
    expect(getMapPinCategory(restaurant({ venue_type: 'restaurant' }))).toBe('restaurant');
    expect(getMapPinStyle(restaurant({ venue_type: 'restaurant' })).fill).toBe('#5a6850');
  });

  it('mappt Pizza und Fast Food auf orange', () => {
    expect(getMapPinCategory(restaurant({ venue_type: 'pizzeria' }))).toBe('fast_pizza');
    expect(getMapPinCategory(restaurant({ venue_type: 'fast_food' }))).toBe('fast_pizza');
    expect(getMapPinStyle(restaurant({ venue_type: 'pizzeria' })).fill).toBe('#D4863A');
  });
});
