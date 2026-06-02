export interface QuickJumpRegion {
  code: string;
  labels: { es: string; en: string; de: string };
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export const QUICK_JUMPS: QuickJumpRegion[] = [
  {
    code: 'ES',
    labels: { es: 'España', en: 'Spain', de: 'Spanien' },
    region: { latitude: 40.4168, longitude: -3.7038, latitudeDelta: 12, longitudeDelta: 12 },
  },
  {
    code: 'ES-MD',
    labels: { es: 'Madrid', en: 'Madrid', de: 'Madrid' },
    region: { latitude: 40.4168, longitude: -3.7038, latitudeDelta: 0.3, longitudeDelta: 0.3 },
  },
  {
    code: 'ES-CT',
    labels: { es: 'Barcelona', en: 'Barcelona', de: 'Barcelona' },
    region: { latitude: 41.3851, longitude: 2.1734, latitudeDelta: 0.2, longitudeDelta: 0.2 },
  },
  {
    code: 'ES-IB',
    labels: { es: 'Mallorca', en: 'Mallorca', de: 'Mallorca' },
    region: { latitude: 39.6, longitude: 2.9, latitudeDelta: 1, longitudeDelta: 1 },
  },
  {
    code: 'ES-VC',
    labels: { es: 'Valencia', en: 'Valencia', de: 'Valencia' },
    region: { latitude: 39.4699, longitude: -0.3763, latitudeDelta: 0.5, longitudeDelta: 0.5 },
  },
  {
    code: 'ES-AN',
    labels: { es: 'Andalucía', en: 'Andalusia', de: 'Andalusien' },
    region: { latitude: 37.2, longitude: -5.5, latitudeDelta: 3, longitudeDelta: 4 },
  },
  {
    code: 'ES-PV',
    labels: { es: 'Euskadi', en: 'Basque Country', de: 'Baskenland' },
    region: { latitude: 43.2, longitude: -2.5, latitudeDelta: 1, longitudeDelta: 1.5 },
  },
];
