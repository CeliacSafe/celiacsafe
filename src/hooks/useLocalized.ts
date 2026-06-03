import { useLanguageStore } from '../store/languageStore';
import { REGION_NAMES, VENUE_TYPE_NAMES, CUISINE_TYPE_NAMES } from '../data/lookups';
import type { RegionCode, Restaurant, VenueType } from '../types/Restaurant';

/**
 * Lokalisierungs-Hook: Lookup-Tabellen + Restaurant-Beschreibungen
 * an die aktuelle Store-Sprache gebunden.
 */
export function useLocalized() {
  const language = useLanguageStore((state) => state.language);

  return {
    /** Lokalisierter Region-Name */
    regionName: (code: string): string => REGION_NAMES[code as RegionCode]?.[language] ?? code,

    /** Lokalisierter Venue-Type */
    venueTypeName: (code: string): string =>
      VENUE_TYPE_NAMES[code as VenueType]?.[language] ?? code,

    /** Lokalisierter Cuisine-Type */
    cuisineName: (code: string): string => CUISINE_TYPE_NAMES[code]?.[language] ?? code,

    /** Lokalisierte Restaurant-Beschreibung mit Fallback */
    description: (restaurant: Restaurant): string => {
      const desc = restaurant[`description_${language}` as keyof Restaurant];
      if (typeof desc === 'string' && desc.trim()) {
        return desc.trim();
      }
      if (restaurant.description_es?.trim()) {
        return restaurant.description_es.trim();
      }
      if (restaurant.description_en?.trim()) {
        return restaurant.description_en.trim();
      }
      return '';
    },

    /** Aktuelle Sprache als Konstante */
    language,
  };
}
