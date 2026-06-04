import data from '../data/restaurants.json';
import type { Restaurant } from '../types/Restaurant';
import { useAdminStore } from '../store/adminStore';

let bundledCache: Restaurant[] | null = null;

export function loadBundledRestaurants(): Restaurant[] {
  if (bundledCache) {
    return bundledCache;
  }
  bundledCache = data.restaurants as Restaurant[];
  return bundledCache;
}

/** Bundled JSON + Admin-Overrides, neue Einträge, ausgeblendete IDs */
export function getMergedRestaurants(): Restaurant[] {
  const { overrides, addedRestaurants, removedIds } = useAdminStore.getState();
  const removed = new Set(removedIds);
  const byId = new Map<string, Restaurant>();

  for (const restaurant of loadBundledRestaurants()) {
    if (!removed.has(restaurant.id)) {
      byId.set(restaurant.id, { ...restaurant });
    }
  }

  for (const restaurant of addedRestaurants) {
    if (!removed.has(restaurant.id)) {
      byId.set(restaurant.id, { ...restaurant });
    }
  }

  for (const [id, override] of Object.entries(overrides)) {
    if (removed.has(id)) continue;
    const base = byId.get(id);
    if (base) {
      byId.set(id, { ...base, ...override, id });
    } else {
      byId.set(id, override);
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function getMergedRestaurantById(id: string): Restaurant | undefined {
  return getMergedRestaurants().find((restaurant) => restaurant.id === id);
}

export function invalidateBundledCache(): void {
  bundledCache = null;
}
