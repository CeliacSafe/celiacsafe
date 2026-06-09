import data from '../data/restaurants.json';
import {
  getRemoteRestaurants,
  getRestaurantSyncState,
  mergeBundledWithRemote,
  type RestaurantDataSource,
} from '../services/restaurantSync';
import { useAdminStore } from '../store/adminStore';
import type { Restaurant } from '../types/Restaurant';
import { isPubliclyVisibleRestaurant } from './searchAndFilter';

export interface MergedRestaurantsOptions {
  /** Admin: auch to_be_verified / pending anzeigen. Standard: nur verified. */
  includeUnverified?: boolean;
}

let bundledCache: Restaurant[] | null = null;

export function loadBundledRestaurants(): Restaurant[] {
  if (bundledCache) {
    return bundledCache;
  }
  bundledCache = data.restaurants as Restaurant[];
  return bundledCache;
}

function getBaseRestaurants(): Restaurant[] {
  const remote = getRemoteRestaurants();
  if (remote) {
    return mergeBundledWithRemote(remote);
  }
  return loadBundledRestaurants();
}

/** Supabase/Cache/Bundled + Admin-Overrides */
export function getMergedRestaurants(options?: MergedRestaurantsOptions): Restaurant[] {
  const { overrides, addedRestaurants, removedIds } = useAdminStore.getState();
  const removed = new Set(removedIds);
  const byId = new Map<string, Restaurant>();

  for (const restaurant of getBaseRestaurants()) {
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

  const merged = Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
  if (options?.includeUnverified) {
    return merged;
  }
  return merged.filter(isPubliclyVisibleRestaurant);
}

export function getMergedRestaurantById(
  id: string,
  options?: MergedRestaurantsOptions
): Restaurant | undefined {
  return getMergedRestaurants(options).find((restaurant) => restaurant.id === id);
}

export function getRestaurantDataSource(): RestaurantDataSource {
  if (!getRemoteRestaurants()) {
    return 'bundle';
  }
  return getRestaurantSyncState().source;
}

export function invalidateBundledCache(): void {
  bundledCache = null;
}
