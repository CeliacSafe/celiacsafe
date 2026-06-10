import type { Restaurant } from '../../types/Restaurant';
import { applyFilters, isPubliclyVisibleRestaurant, matchesFilter, matchesQuery, sortRestaurants } from '../searchAndFilter';

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

const avocadoMallorca = createRestaurant({
  id: 'es_ib_001',
  name: 'Avocado Mallorca',
  region_code: 'ES-IB',
  region_name: 'Illes Balears',
  city: 'Palma de Mallorca',
  district: 'Cala Major',
  venue_type: 'brunch_place',
  face_program: true,
  aoecs_certified: false,
  cuisine_types: ['saludable', 'vegana'],
  last_verified_at: '2026-05-10',
});

const asDeBastos = createRestaurant({
  id: 'es_md_001',
  name: 'As de Bastos',
  region_code: 'ES-MD',
  region_name: 'Comunidad de Madrid',
  city: 'Madrid',
  venue_type: 'restaurant',
  face_program: true,
  aoecs_certified: false,
  last_verified_at: '2026-04-01',
});

const elFartuquin = createRestaurant({
  id: 'es_as_001',
  name: 'El Fartuquín',
  region_code: 'ES-AS',
  region_name: 'Asturias',
  city: 'Oviedo',
  venue_type: 'restaurant',
  face_program: false,
  aoecs_certified: false,
  last_verified_at: '2025-12-20',
});

const gocceDiLatte = createRestaurant({
  id: 'es_ct_001',
  name: 'Gocce di Latte',
  region_code: 'ES-CT',
  region_name: 'Cataluña',
  city: 'Barcelona',
  venue_type: 'ice_cream',
  face_program: false,
  aoecs_certified: true,
  last_verified_at: '2026-06-01',
});

const allRestaurants = [avocadoMallorca, asDeBastos, elFartuquin, gocceDiLatte];

describe('isPubliclyVisibleRestaurant', () => {
  it('zeigt nur verified Lokale', () => {
    expect(isPubliclyVisibleRestaurant(createRestaurant({ verification_status: 'verified' }))).toBe(
      true
    );
    expect(
      isPubliclyVisibleRestaurant(createRestaurant({ verification_status: 'to_be_verified' }))
    ).toBe(false);
    expect(
      isPubliclyVisibleRestaurant(createRestaurant({ verification_status: 'pending_verification' }))
    ).toBe(false);
    expect(
      isPubliclyVisibleRestaurant(createRestaurant({ verification_status: 'in_verification' }))
    ).toBe(false);
    expect(isPubliclyVisibleRestaurant(createRestaurant({ verification_status: 'rejected' }))).toBe(
      false
    );
  });
});

describe('matchesQuery', () => {
  // Leere Suchanfrage soll immer matchen.
  it('matcht bei leerer Query alle Restaurants', () => {
    expect(matchesQuery(avocadoMallorca, '')).toBe(true);
    expect(matchesQuery(asDeBastos, '')).toBe(true);
    expect(matchesQuery(elFartuquin, '')).toBe(true);
    expect(matchesQuery(gocceDiLatte, '')).toBe(true);
  });

  it('matcht "mallorca" fuer Avocado Mallorca', () => {
    expect(matchesQuery(avocadoMallorca, 'mallorca')).toBe(true);
  });

  it('matcht "cataluna" auch ohne ñ', () => {
    expect(matchesQuery(gocceDiLatte, 'cataluna')).toBe(true);
  });

  it('matcht "OVIEDO" unabhaengig von Gross-/Kleinschreibung', () => {
    expect(matchesQuery(elFartuquin, 'OVIEDO')).toBe(true);
  });

  it('matcht mehrere Begriffe mit UND-Logik', () => {
    expect(matchesQuery(avocadoMallorca, 'palma cala')).toBe(true);
  });

  it('matcht "tokyo" fuer kein Mock-Restaurant', () => {
    const result = allRestaurants.some((r) => matchesQuery(r, 'tokyo'));
    expect(result).toBe(false);
  });

  it('matcht Ländernamen in der Suche', () => {
    expect(matchesQuery(avocadoMallorca, 'spanien')).toBe(true);
    expect(matchesQuery(createRestaurant({ country_code: 'DE', city: 'Berlin' }), 'deutschland')).toBe(
      true
    );
  });
});

describe('matchesFilter', () => {
  it('laesst bei leeren Filtern alle Restaurants durch', () => {
    const criteria = {
      selectedVenueTypes: [],
      selectedRegions: [],
      selectedPriceRanges: [],
      onlyFaceCertified: false,
      onlyAoecsCertified: false,
    };
    const result = allRestaurants.filter((r) => matchesFilter(r, criteria));
    expect(result).toHaveLength(4);
  });

  it('filtert nach venue_type=restaurant', () => {
    const criteria = {
      selectedVenueTypes: ['restaurant'],
      selectedRegions: [],
      selectedPriceRanges: [],
      onlyFaceCertified: false,
      onlyAoecsCertified: false,
    };
    const result = allRestaurants.filter((r) => matchesFilter(r, criteria));
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(['As de Bastos', 'El Fartuquín']);
  });

  it('filtert nach region=ES-IB', () => {
    const criteria = {
      selectedVenueTypes: [],
      selectedRegions: ['ES-IB'],
      selectedPriceRanges: [],
      onlyFaceCertified: false,
      onlyAoecsCertified: false,
    };
    const result = allRestaurants.filter((r) => matchesFilter(r, criteria));
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Avocado Mallorca');
  });

  it('filtert nur FACE-zertifizierte', () => {
    const criteria = {
      selectedVenueTypes: [],
      selectedRegions: [],
      selectedPriceRanges: [],
      onlyFaceCertified: true,
      onlyAoecsCertified: false,
    };
    const result = allRestaurants.filter((r) => matchesFilter(r, criteria));
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(['Avocado Mallorca', 'As de Bastos']);
  });

  it('kombiniert mehrere Filter als UND-Verknuepfung', () => {
    const criteria = {
      selectedVenueTypes: ['restaurant'],
      selectedRegions: ['ES-MD', 'ES-AS'],
      selectedPriceRanges: [],
      onlyFaceCertified: true,
      onlyAoecsCertified: false,
    };
    const result = allRestaurants.filter((r) => matchesFilter(r, criteria));
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('As de Bastos');
  });

  it('filtert nach laktosefrei in Beschreibung oder cuisine_types', () => {
    const lactoseFree = createRestaurant({
      id: 'lactose-1',
      name: 'Sin Lactosa Cafe',
      description_es: 'Opciones sin lactosa disponibles.',
    });
    const regular = createRestaurant({ id: 'regular-1', name: 'Regular Cafe' });
    const criteria = {
      selectedVenueTypes: [],
      selectedRegions: [],
      selectedPriceRanges: [],
      onlyFaceCertified: false,
      onlyAoecsCertified: false,
      dietLactoseFree: true,
    };
    expect(matchesFilter(lactoseFree, criteria)).toBe(true);
    expect(matchesFilter(regular, criteria)).toBe(false);
  });

  it('filtert nach Profil-Praeferenzen (vegan, laktosefrei, weizenfrei)', () => {
    const veganRestaurant = createRestaurant({
      id: 'vegan-1',
      cuisine_types: ['Vegana'],
    });
    const nonVegan = createRestaurant({ id: 'non-vegan-1' });
    const base = {
      selectedVenueTypes: [],
      selectedRegions: [],
      selectedPriceRanges: [],
      onlyFaceCertified: false,
      onlyAoecsCertified: false,
    };

    expect(
      matchesFilter(veganRestaurant, {
        ...base,
        profileDietary: { lactoseFree: false, vegan: true, wheatFree: false },
      })
    ).toBe(true);
    expect(
      matchesFilter(nonVegan, {
        ...base,
        profileDietary: { lactoseFree: false, vegan: true, wheatFree: false },
      })
    ).toBe(false);

    const wheatExplicit = createRestaurant({
      id: 'wheat-1',
      allergens: { sin_trigo: false },
    });
    expect(
      matchesFilter(wheatExplicit, {
        ...base,
        profileDietary: { lactoseFree: false, vegan: false, wheatFree: true },
      })
    ).toBe(false);
    expect(
      matchesFilter(createRestaurant({ id: 'wheat-2', verification_status: 'verified' }), {
        ...base,
        profileDietary: { lactoseFree: false, vegan: false, wheatFree: true },
      })
    ).toBe(true);
  });
});

describe('sortRestaurants', () => {
  it('sortiert name_asc alphabetisch aufsteigend', () => {
    const result = sortRestaurants(allRestaurants, 'name_asc');
    expect(result.map((r) => r.name)).toEqual([
      'As de Bastos',
      'Avocado Mallorca',
      'El Fartuquín',
      'Gocce di Latte',
    ]);
  });

  it('sortiert name_desc alphabetisch absteigend', () => {
    const result = sortRestaurants(allRestaurants, 'name_desc');
    expect(result.map((r) => r.name)).toEqual([
      'Gocce di Latte',
      'El Fartuquín',
      'Avocado Mallorca',
      'As de Bastos',
    ]);
  });

  it('sortiert recently_verified nach last_verified_at desc', () => {
    const result = sortRestaurants(allRestaurants, 'recently_verified');
    expect(result.map((r) => r.name)).toEqual([
      'Gocce di Latte',
      'Avocado Mallorca',
      'As de Bastos',
      'El Fartuquín',
    ]);
  });
});

describe('applyFilters', () => {
  it('kombiniert Suche, Filter und Sortierung', () => {
    const result = applyFilters(
      allRestaurants,
      'de',
      {
        selectedVenueTypes: ['restaurant', 'brunch_place'],
        selectedRegions: ['ES-MD', 'ES-IB'],
        selectedPriceRanges: [],
        onlyFaceCertified: true,
        onlyAoecsCertified: false,
      },
      'name_desc'
    );

    expect(result.map((r) => r.name)).toEqual(['Avocado Mallorca', 'As de Bastos']);
  });
});
