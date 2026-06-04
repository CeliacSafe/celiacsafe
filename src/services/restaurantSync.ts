import AsyncStorage from '@react-native-async-storage/async-storage';

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Restaurant } from '../types/Restaurant';
import { mapSupabaseRestaurantRow, type SupabaseRestaurantRow } from '../utils/mapSupabaseRestaurant';

const CACHE_KEY = '@celiacsafe/restaurants_cache_v1';

const RESTAURANT_SELECT = `
  id, name, slug, country_code, region_code, region_name, province, city, district,
  postal_code, address_street, latitude, longitude, venue_type, cuisine_types,
  price_range, meal_types, verification_status, verification_methods, last_verified_at,
  face_program, aoecs_certified, national_authority, phone, whatsapp, email, website,
  menu_url, instagram, facebook, opening_hours, seasonal_closure, description_es,
  description_en, description_de, featured_image_url,
  delivery_links ( platform, url, is_active ),
  reservation_links ( platform, url, is_active )
`;

export type RestaurantDataSource = 'remote' | 'cache' | 'bundle';

interface CachePayload {
  fetchedAt: string;
  restaurants: Restaurant[];
}

export interface RestaurantSyncState {
  source: RestaurantDataSource;
  lastSyncedAt: string | null;
  syncing: boolean;
  syncError: string | null;
}

type Listener = () => void;

let remoteRestaurants: Restaurant[] | null = null;
let cacheHydrated = false;
let bootstrapStarted = false;

let state: RestaurantSyncState = {
  source: 'bundle',
  lastSyncedAt: null,
  syncing: false,
  syncError: null,
};

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<RestaurantSyncState>) {
  state = { ...state, ...patch };
  notify();
}

export function subscribeRestaurantSync(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRestaurantSyncState(): RestaurantSyncState {
  return state;
}

export function getRemoteRestaurants(): Restaurant[] | null {
  return remoteRestaurants;
}

export function isRestaurantCacheHydrated(): boolean {
  return cacheHydrated;
}

async function persistCache(restaurants: Restaurant[]): Promise<void> {
  const payload: CachePayload = {
    fetchedAt: new Date().toISOString(),
    restaurants,
  };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

/** Liest den zuletzt gespeicherten Supabase-Stand (offline-fähig). */
export async function hydrateRestaurantCache(): Promise<void> {
  if (cacheHydrated) {
    return;
  }

  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CachePayload;
      if (Array.isArray(parsed.restaurants) && parsed.restaurants.length > 0) {
        remoteRestaurants = parsed.restaurants;
        setState({
          source: 'cache',
          lastSyncedAt: parsed.fetchedAt ?? null,
          syncError: null,
        });
      }
    }
  } catch (error) {
    console.warn('Restaurant-Cache konnte nicht gelesen werden:', error);
  } finally {
    cacheHydrated = true;
    notify();
  }
}

/** Live-Abruf von Supabase; bei Erfolg Cache aktualisieren. */
export async function syncRestaurantsFromSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  setState({ syncing: true, syncError: null });

  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select(RESTAURANT_SELECT)
      .eq('is_published', true)
      .eq('is_hidden', false)
      .neq('verification_status', 'rejected')
      .order('name');

    if (error) {
      throw error;
    }

    const restaurants = ((data ?? []) as SupabaseRestaurantRow[])
      .map(mapSupabaseRestaurantRow)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));

    remoteRestaurants = restaurants;
    const fetchedAt = new Date().toISOString();
    await persistCache(restaurants);

    setState({
      source: 'remote',
      lastSyncedAt: fetchedAt,
      syncing: false,
      syncError: null,
    });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync fehlgeschlagen';
    console.warn('Supabase Restaurant-Sync:', message);
    setState({ syncing: false, syncError: message });
    return false;
  }
}

/** Cache laden, dann im Hintergrund Supabase synchronisieren. */
export async function bootstrapRestaurantData(): Promise<void> {
  if (bootstrapStarted) {
    return;
  }
  bootstrapStarted = true;

  await hydrateRestaurantCache();

  if (isSupabaseConfigured) {
    await syncRestaurantsFromSupabase();
  }
}
