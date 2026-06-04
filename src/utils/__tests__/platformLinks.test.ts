import type { Restaurant } from '../../types/Restaurant';
import {
  buildGlovoUrl,
  buildTheForkUrl,
  resolveDeliveryUrl,
  resolveReservationUrl,
  toMapFilterCriteria,
} from '../platformLinks';

function baseRestaurant(overrides: Partial<Restaurant> = {}): Restaurant {
  return {
    id: 'es_md_001',
    name: 'As de Bastos',
    country_code: 'ES',
    region_code: 'ES-MD',
    region_name: 'Comunidad de Madrid',
    city: 'Madrid',
    verification_status: 'verified',
    slug: 'as-de-bastos-madrid',
    ...overrides,
  };
}

describe('platformLinks', () => {
  it('baut TheFork-URL aus Slug', () => {
    expect(buildTheForkUrl(baseRestaurant())).toContain('as-de-bastos-madrid');
  });

  it('baut Glovo-Suche aus Name und Stadt', () => {
    const url = buildGlovoUrl(baseRestaurant());
    expect(url).toContain('glovoapp.com');
    expect(url).toContain('As');
  });

  it('loest leere Glovo-URL in der Datenbank auf', () => {
    const url = resolveDeliveryUrl(baseRestaurant(), {
      platform: 'glovo',
      url: '',
      is_active: true,
    });
    expect(url).toContain('glovoapp.com');
  });

  it('loest leere TheFork-URL in der Datenbank auf', () => {
    const url = resolveReservationUrl(baseRestaurant(), {
      platform: 'thefork',
      url: '',
      is_active: true,
    });
    expect(url).toContain('thefork');
  });

  it('entfernt Suche-only Filter fuer die Karte', () => {
    const criteria = {
      selectedRegions: ['ES-IB'],
      categoryTab: 'community' as const,
      dietVegan: true,
      minRating: '4' as const,
    };
    expect(toMapFilterCriteria(criteria)).toEqual({ selectedRegions: ['ES-IB'] });
  });
});
