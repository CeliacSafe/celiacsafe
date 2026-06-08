import type { DeliveryLink, Restaurant } from '../../types/Restaurant';
import {
  getAvailableCities,
  getAvailableCountryCodes,
  getAvailableRegionCodes,
  getAvailableVenueTypes,
  getDeliveryFilterAvailability,
} from '../filterAvailability';
import { matchesFilter } from '../searchAndFilter';

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

describe('filterAvailability', () => {
  const madridRestaurant = createRestaurant({
    id: 'md-1',
    name: 'Madrid Place',
    region_code: 'ES-MD',
    city: 'Madrid',
    venue_type: 'restaurant',
    delivery_links: [{ platform: 'glovo', url: 'https://glovo.app', is_active: true }],
  });

  const mallorcaBrunch = createRestaurant({
    id: 'ib-1',
    name: 'Palma Brunch',
    region_code: 'ES-IB',
    city: 'Palma de Mallorca',
    venue_type: 'brunch_place',
  });

  const madridPizza = createRestaurant({
    id: 'md-2',
    name: 'Pizza Madrid',
    region_code: 'ES-MD',
    city: 'Madrid',
    venue_type: 'pizzeria',
  });

  const berlinCafe = createRestaurant({
    id: 'de-1',
    name: 'Berlin Cafe',
    country_code: 'DE',
    region_code: 'DE-BE',
    city: 'Berlin',
    venue_type: 'cafe',
  });

  const all = [madridRestaurant, mallorcaBrunch, madridPizza, berlinCafe];
  const baseCriteria = {
    selectedVenueTypes: [],
    selectedRegions: [],
    selectedPriceRanges: [],
    onlyFaceCertified: false,
    onlyAoecsCertified: false,
    selectedCountry: null,
    selectedCity: null,
    deliveryAvailable: null,
    dietVegan: false,
    dietVegetarian: false,
    minRating: 'all' as const,
    categoryTab: 'all' as const,
    searchQuery: '',
  };

  it('lists only venue types present in selected city', () => {
    const types = getAvailableVenueTypes(all, {
      ...baseCriteria,
      selectedCity: 'Madrid',
    });
    expect(types.sort()).toEqual(['pizzeria', 'restaurant']);
    expect(types).not.toContain('brunch_place');
  });

  it('excludes pizzeria when Madrid has none in scoped pool', () => {
    const onlyPalma = [mallorcaBrunch];
    const types = getAvailableVenueTypes(onlyPalma, {
      ...baseCriteria,
      selectedCity: 'Palma de Mallorca',
    });
    expect(types).toEqual(['brunch_place']);
    expect(types).not.toContain('pizzeria');
  });

  it('lists countries available in pool', () => {
    const countries = getAvailableCountryCodes(all, baseCriteria);
    expect(countries).toEqual(['DE', 'ES']);
  });

  it('filters by country code and free text', () => {
    const byCode = all.filter((r) => matchesFilter(r, { ...baseCriteria, selectedCountry: 'ES' }));
    expect(byCode.every((r) => r.country_code === 'ES')).toBe(true);

    const byText = all.filter((r) =>
      matchesFilter(r, { ...baseCriteria, selectedCountry: 'Spanien' })
    );
    expect(byText.every((r) => r.country_code === 'ES')).toBe(true);
  });

  it('filters city by partial text', () => {
    const result = all.filter((r) => matchesFilter(r, { ...baseCriteria, selectedCity: 'Palma' }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('ib-1');
  });

  it('detects mixed delivery availability in region', () => {
    const availability = getDeliveryFilterAvailability(all, {
      ...baseCriteria,
      selectedRegions: ['ES-MD'],
    });
    expect(availability).toEqual({ hasWithDelivery: true, hasWithoutDelivery: true });
  });

  it('narrows cities when region is selected', () => {
    const cities = getAvailableCities(all, {
      ...baseCriteria,
      selectedRegions: ['ES-IB'],
    });
    expect(cities).toEqual(['Palma de Mallorca']);
  });

  it('filters by delivery yes/no', () => {
    const withDelivery = all.filter((r) =>
      matchesFilter(r, { ...baseCriteria, deliveryAvailable: true })
    );
    expect(withDelivery).toHaveLength(1);
    expect(withDelivery[0].id).toBe('md-1');

    const withoutDelivery = all.filter((r) =>
      matchesFilter(r, { ...baseCriteria, deliveryAvailable: false })
    );
    expect(withoutDelivery).toHaveLength(3);
    expect(withoutDelivery.map((r) => r.id).sort()).toEqual(['de-1', 'ib-1', 'md-2']);
  });

  it('counts own_takeaway as delivery for yes/no filter', () => {
    const withOwnTakeaway = createRestaurant({
      id: 'de-1',
      delivery_links: [
        {
          platform: 'own_takeaway',
          url: 'https://example.com/order',
          is_active: true,
        },
      ] as unknown as DeliveryLink[],
    });
    const availability = getDeliveryFilterAvailability([withOwnTakeaway], baseCriteria);
    expect(availability.hasWithDelivery).toBe(true);
    expect(availability.hasWithoutDelivery).toBe(false);
  });

  it('lists only regions with restaurants', () => {
    const regions = getAvailableRegionCodes(all, baseCriteria);
    expect(regions).toEqual(['DE-BE', 'ES-IB', 'ES-MD']);
  });
});
