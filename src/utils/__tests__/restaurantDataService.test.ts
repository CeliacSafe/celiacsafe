jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

import type { Restaurant } from '../../types/Restaurant';
import { mergeBundledWithRemote } from '../../services/restaurantSync';

function createRestaurant(id: string, country: 'ES' | 'DE'): Restaurant {
  return {
    id,
    name: `Restaurant ${id}`,
    country_code: country,
    region_code: country === 'DE' ? 'DE-BY' : 'ES-MD',
    region_name: country === 'DE' ? 'Bayern' : 'Madrid',
    city: country === 'DE' ? 'München' : 'Madrid',
    verification_status: 'verified',
  };
}

describe('mergeBundledWithRemote', () => {
  it('behält Bundle-Einträge die nicht in Supabase sind', () => {
    const remoteOnly = [createRestaurant('es_001', 'ES')];
    const merged = mergeBundledWithRemote(remoteOnly);

    const countries = new Set(merged.map((r) => r.country_code));
    expect(countries.has('ES')).toBe(true);
    expect(countries.has('DE')).toBe(true);
    expect(merged.length).toBeGreaterThan(remoteOnly.length);
  });

  it('lässt Supabase-Einträge Bundle-Einträge mit gleicher ID überschreiben', () => {
    const remote = [
      {
        ...createRestaurant('es_001', 'ES'),
        name: 'Remote Name',
      },
    ];
    const merged = mergeBundledWithRemote(remote);
    const match = merged.find((r) => r.id === 'es_001');
    expect(match?.name).toBe('Remote Name');
  });

  it('ergänzt Beschreibungen aus dem Bundle wenn Supabase sie nicht hat', () => {
    const remote = [
      {
        ...createRestaurant('ES-CT-GRANOLLERS-001', 'ES'),
        name: '0% Gluten KrümCoffee Granollers',
        city: 'Granollers',
      },
    ];
    const merged = mergeBundledWithRemote(remote);
    const match = merged.find((r) => r.id === 'ES-CT-GRANOLLERS-001');
    expect(match?.description_de).toContain('KrümCoffee');
    expect(match?.description_en).toContain('KrümCoffee');
    expect(match?.description_es).toContain('KrümCoffee');
  });
});
