import type { Restaurant } from '../types/Restaurant';

function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

function isPremiumPartner(restaurant: Restaurant): boolean {
  return restaurant.is_premium_partner === true;
}

/** Gleiche Stadt (case-insensitive) — Premiumpartner zuerst, sonst tieBreaker. */
export function compareWithPremiumInCity(
  a: Restaurant,
  b: Restaurant,
  tieBreaker: (left: Restaurant, right: Restaurant) => number
): number {
  if (normalizeCity(a.city) === normalizeCity(b.city)) {
    const aPremium = isPremiumPartner(a);
    const bPremium = isPremiumPartner(b);
    if (aPremium !== bPremium) {
      return aPremium ? -1 : 1;
    }
  }
  return tieBreaker(a, b);
}

export function sortRestaurantsWithPremiumInCity(
  restaurants: Restaurant[],
  tieBreaker: (left: Restaurant, right: Restaurant) => number
): Restaurant[] {
  return [...restaurants].sort((a, b) => compareWithPremiumInCity(a, b, tieBreaker));
}
