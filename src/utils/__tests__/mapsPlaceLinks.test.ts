import { Platform } from 'react-native';

import type { Restaurant } from '../../types/Restaurant';
import {
  canOpenExternalMaps,
  formatMapsSearchQuery,
  resolveAppleMapsPlaceUrl,
  resolveGoogleMapsPlaceUrl,
  resolveMapsPlaceUrl,
} from '../mapsPlaceLinks';

const base: Restaurant = {
  id: 'es_md_001',
  name: 'As de Bastos',
  country_code: 'ES',
  region_code: 'ES-MD',
  region_name: 'Comunidad de Madrid',
  city: 'Madrid',
  verification_status: 'verified',
  address_street: 'Calle Ejemplo 1',
  postal_code: '28001',
  latitude: 40.45,
  longitude: -3.7,
};

describe('formatMapsSearchQuery', () => {
  it('includes name and address parts', () => {
    expect(formatMapsSearchQuery(base)).toContain('As de Bastos');
    expect(formatMapsSearchQuery(base)).toContain('Madrid');
  });
});

describe('resolveGoogleMapsPlaceUrl', () => {
  it('uses stored profile URL', () => {
    const url = resolveGoogleMapsPlaceUrl({
      ...base,
      google_maps_url: 'https://www.google.com/maps/place/As+de+Bastos',
    });
    expect(url).toBe('https://www.google.com/maps/place/As+de+Bastos');
  });

  it('falls back to search API with name and address', () => {
    const url = resolveGoogleMapsPlaceUrl(base);
    expect(url).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
    expect(url).toContain(encodeURIComponent('As de Bastos'));
  });
});

describe('resolveAppleMapsPlaceUrl', () => {
  it('uses stored profile URL', () => {
    const url = resolveAppleMapsPlaceUrl({
      ...base,
      apple_maps_url: 'https://maps.apple.com/?address=Madrid',
    });
    expect(url).toBe('https://maps.apple.com/?address=Madrid');
  });

  it('uses ll and q when coordinates exist', () => {
    const url = resolveAppleMapsPlaceUrl(base);
    expect(url).toContain('maps.apple.com');
    expect(url).toContain('ll=40.45,-3.7');
  });
});

describe('resolveMapsPlaceUrl', () => {
  afterEach(() => {
    Platform.OS = 'ios';
  });

  it('prefers Apple on iOS', () => {
    Platform.OS = 'ios';
    const url = resolveMapsPlaceUrl({
      ...base,
      apple_maps_url: 'https://maps.apple.com/?cid=123',
      google_maps_url: 'https://www.google.com/maps/place/x',
    });
    expect(url).toContain('maps.apple.com');
  });

  it('prefers Google on Android', () => {
    Platform.OS = 'android';
    const url = resolveMapsPlaceUrl({
      ...base,
      apple_maps_url: 'https://maps.apple.com/?cid=123',
      google_maps_url: 'https://www.google.com/maps/place/x',
    });
    expect(url).toContain('google.com');
  });
});

describe('canOpenExternalMaps', () => {
  it('is true with address or stored URL', () => {
    expect(canOpenExternalMaps(base)).toBe(true);
    expect(
      canOpenExternalMaps({
        ...base,
        address_street: undefined,
        postal_code: undefined,
        latitude: undefined,
        longitude: undefined,
        google_maps_url: 'https://www.google.com/maps/place/x',
      }),
    ).toBe(true);
  });
});
