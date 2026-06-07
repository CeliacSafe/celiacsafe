import type { DeliveryLink, Restaurant } from '../../types/Restaurant';
import {
  getAvailableCities,
  getAvailableDeliveryPlatforms,
  getAvailableRegionCodes,
  getAvailableVenueTypes,
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

  const all = [madridRestaurant, mallorcaBrunch, madridPizza];
  const baseCriteria = {
    selectedVenueTypes: [],
    selectedRegions: [],
    selectedPriceRanges: [],
    onlyFaceCertified: false,
    onlyAoecsCertified: false,
    selectedCity: null,
    selectedDeliveryPlatform: null,
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

  it('lists delivery platforms available in region', () => {
    const platforms = getAvailableDeliveryPlatforms(all, {
      ...baseCriteria,
      selectedRegions: ['ES-MD'],
    });
    expect(platforms).toEqual(['glovo']);
  });

  it('narrows cities when region is selected', () => {
    const cities = getAvailableCities(all, {
      ...baseCriteria,
      selectedRegions: ['ES-IB'],
    });
    expect(cities).toEqual(['Palma de Mallorca']);
  });

  it('filters by delivery platform', () => {
    const criteria = {
      ...baseCriteria,
      selectedDeliveryPlatform: 'glovo',
    };
    const result = all.filter((r) => matchesFilter(r, criteria));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('md-1');
  });

  it('normalizes own_takeaway to own_delivery in filter options', () => {
    const withOwnTakeaway = createRestaurant({
      id: 'de-1',
      delivery_links: [
        {
          platform: 'own_takeaway',
          url: 'https://example.com/order',
          is_active: true,
        },
      ] as DeliveryLink[],
    });
    const platforms = getAvailableDeliveryPlatforms([withOwnTakeaway], baseCriteria);
    expect(platforms).toContain('own_delivery');
  });

  it('lists only regions with restaurants', () => {
    const regions = getAvailableRegionCodes(all, baseCriteria);
    expect(regions).toEqual(['ES-IB', 'ES-MD']);
  });
});
