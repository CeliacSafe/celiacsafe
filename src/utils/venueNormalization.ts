/**
 * Normalisiert Roh-Werte aus der Datenpipeline (Title-Case-Englisch, teils
 * zusammengesetzt wie "Bakery / Café") auf die kanonischen Codes der App.
 *
 * Quelle der Mismatches: excel-to-json.py normalisiert venue_type/cuisine_types
 * nicht, daher passiert das hier zur Laufzeit (Bundle + Supabase identisch).
 */

import type { Restaurant, VenueType } from '../types/Restaurant';

const VENUE_TYPE_ALIASES: Record<string, VenueType> = {
  restaurant: 'restaurant',
  cafe: 'cafe',
  bistro: 'restaurant',
  bakery: 'bakery',
  obrador: 'bakery',
  manufactory: 'bakery',
  'pastry shop': 'pastry_shop',
  pastry: 'pastry_shop',
  patisserie: 'pastry_shop',
  churreria: 'pastry_shop',
  'ice cream': 'ice_cream',
  gelateria: 'ice_cream',
  heladeria: 'ice_cream',
  pizzeria: 'pizzeria',
  bar: 'bar_tapas',
  tapas: 'bar_tapas',
  sidreria: 'bar_tapas',
  'fast food': 'fast_food',
  takeaway: 'fast_food',
  'to-go shop': 'fast_food',
  'click & collect': 'fast_food',
  hotel: 'hotel_restaurant',
  'hotel restaurant': 'hotel_restaurant',
  'food truck': 'food_truck',
  catering: 'catering',
  brunch: 'brunch_place',
  'brunch place': 'brunch_place',
  burger: 'burger_joint',
  'burger joint': 'burger_joint',
  asian: 'asian_restaurant',
  'asian restaurant': 'asian_restaurant',
};

function canonicalizeSegment(segment: string): VenueType | null {
  const key = segment
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (!key) {
    return null;
  }
  if (VENUE_TYPE_ALIASES[key]) {
    return VENUE_TYPE_ALIASES[key];
  }
  // Wenn der Code bereits kanonisch ist (z. B. "bakery", "pastry_shop").
  const underscored = key.replace(/\s+/g, '_');
  const known = Object.values(VENUE_TYPE_ALIASES).find((v) => v === underscored);
  return known ?? null;
}

/**
 * Wandelt einen rohen venue_type-Wert in alle passenden kanonischen Codes um.
 * Zusammengesetzte Werte ("Bakery / Café") liefern mehrere Codes.
 */
export function normalizeVenueTypes(raw: string | undefined | null): VenueType[] {
  if (!raw) {
    return [];
  }
  const segments = raw.split(/[/,]/);
  const result: VenueType[] = [];
  for (const segment of segments) {
    const code = canonicalizeSegment(segment);
    if (code && !result.includes(code)) {
      result.push(code);
    }
  }
  return result;
}

/** Primärer (erster) kanonischer Venue-Code – für Anzeige/Icon. */
export function primaryVenueType(raw: string | undefined | null): VenueType | null {
  return normalizeVenueTypes(raw)[0] ?? null;
}

export function restaurantMatchesVenueType(
  restaurant: Restaurant,
  code: string
): boolean {
  return normalizeVenueTypes(restaurant.venue_type).includes(code as VenueType);
}

type DietKind = 'vegan' | 'vegetarian';

const DIET_MATCHERS: Record<DietKind, (cuisine: string) => boolean> = {
  // "Vegan", "Vegan bakery", "Vegana" → vegan; "vegan" steckt nicht in "vegetarian"
  vegan: (c) => c.includes('vegan'),
  // "Vegetarian", "Vegetariana", "Veggie" → vegetarian
  vegetarian: (c) => c.includes('vegetarian') || c.includes('veggie'),
};

/** Prüft, ob die cuisine_types eines Lokals eine Diät-Kennung enthalten. */
export function cuisineMatchesDiet(
  cuisineTypes: string[] | undefined,
  diet: DietKind
): boolean {
  if (!cuisineTypes?.length) {
    return false;
  }
  const match = DIET_MATCHERS[diet];
  return cuisineTypes.some((c) =>
    match(c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );
}
