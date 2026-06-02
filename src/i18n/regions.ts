import type { RegionCode } from '../types/Restaurant';
import type { LocalizedRecord } from './getLocalizedName';

export const REGION_NAMES: Record<RegionCode, LocalizedRecord> = {
  'ES-AN': { es: 'Andalucía', en: 'Andalusia', de: 'Andalusien' },
  'ES-AR': { es: 'Aragón', en: 'Aragon', de: 'Aragonien' },
  'ES-AS': { es: 'Asturias', en: 'Asturias', de: 'Asturien' },
  'ES-CN': { es: 'Canarias', en: 'Canary Islands', de: 'Kanarische Inseln' },
  'ES-CB': { es: 'Cantabria', en: 'Cantabria', de: 'Kantabrien' },
  'ES-CL': { es: 'Castilla y León', en: 'Castile and León', de: 'Kastilien und León' },
  'ES-CM': { es: 'Castilla-La Mancha', en: 'Castilla-La Mancha', de: 'Kastilien-La Mancha' },
  'ES-CT': { es: 'Cataluña', en: 'Catalonia', de: 'Katalonien' },
  'ES-EX': { es: 'Extremadura', en: 'Extremadura', de: 'Extremadura' },
  'ES-GA': { es: 'Galicia', en: 'Galicia', de: 'Galicien' },
  'ES-IB': { es: 'Illes Balears', en: 'Balearic Islands', de: 'Balearen' },
  'ES-RI': { es: 'La Rioja', en: 'La Rioja', de: 'La Rioja' },
  'ES-MD': {
    es: 'Comunidad de Madrid',
    en: 'Community of Madrid',
    de: 'Autonome Gemeinschaft Madrid',
  },
  'ES-MC': { es: 'Región de Murcia', en: 'Region of Murcia', de: 'Region Murcia' },
  'ES-NC': { es: 'Navarra', en: 'Navarre', de: 'Navarra' },
  'ES-PV': { es: 'País Vasco', en: 'Basque Country', de: 'Baskenland' },
  'ES-VC': { es: 'Comunitat Valenciana', en: 'Valencian Community', de: 'Valencia' },
  'ES-CE': { es: 'Ceuta', en: 'Ceuta', de: 'Ceuta' },
  'ES-ML': { es: 'Melilla', en: 'Melilla', de: 'Melilla' },
};
