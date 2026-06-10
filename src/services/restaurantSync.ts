import AsyncStorage from '@react-native-async-storage/async-storage';

import bundledData from '../data/restaurants.json';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Restaurant } from '../types/Restaurant';
import { mapSupabaseRestaurantRow, type SupabaseRestaurantRow } from '../utils/mapSupabaseRestaurant';

const CACHE_KEY = '@celiacsafe/restaurants_cache_v2';

const RESTAURANT_SELECT = `
  id, name, slug, country_code, region_code, region_name, province, city, district,
  postal_code, address_street, latitude, longitude,
  google_maps_url, apple_maps_url,
  venue_type, cuisine_types,
  price_range, meal_types, verification_status, verification_methods, last_verified_at,
  face_program, aoecs_certified, is_certified, category, allergens, national_authority, phone, whatsapp, email, website,
  menu_url, instagram, facebook, opening_hours, seasonal_closure, description_es,
  description_en, description_de, featured_image_url, is_premium_partner,
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

function normalizeLookupKey(value: string | undefined | null): string {
  return (value ?? '').trim().toLowerCase();
}

interface BundleLookups {
  byId: Map<string, Restaurant>;
  bySlug: Map<string, Restaurant>;
  byName: Map<string, Restaurant>;
  cityCentroids: Map<string, { latitude: number; longitude: number }>;
}

function buildBundleLookups(bundled: Restaurant[]): BundleLookups {
  const byId = new Map<string, Restaurant>();
  const bySlug = new Map<string, Restaurant>();
  const byName = new Map<string, Restaurant>();
  const cityCentroids = new Map<string, { latitude: number; longitude: number }>();

  for (const restaurant of bundled) {
    byId.set(normalizeLookupKey(restaurant.id), restaurant);
    if (restaurant.slug) {
      bySlug.set(normalizeLookupKey(restaurant.slug), restaurant);
    }
    byName.set(normalizeLookupKey(restaurant.name), restaurant);
    if (
      restaurant.city &&
      restaurant.latitude != null &&
      restaurant.longitude != null
    ) {
      const cityKey = normalizeLookupKey(restaurant.city);
      if (!cityCentroids.has(cityKey)) {
        cityCentroids.set(cityKey, {
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
        });
      }
    }
  }

  return { byId, bySlug, byName, cityCentroids };
}

/** Maps-Deeplinks, Koordinaten und Texte aus restaurants.json ergänzen, solange Supabase/Cache unvollständig sind. */
function pickBundledText(
  remoteValue: string | undefined,
  bundledValue: string | undefined
): string | undefined {
  const remote = remoteValue?.trim();
  if (remote) {
    return remote;
  }
  const bundled = bundledValue?.trim();
  return bundled || undefined;
}

export function enrichRestaurantsFromBundle(restaurants: Restaurant[]): Restaurant[] {
  const lookups = buildBundleLookups(bundledData.restaurants as Restaurant[]);

  return restaurants.map((restaurant) => {
    const bundledMatch =
      lookups.byId.get(normalizeLookupKey(restaurant.id)) ??
      (restaurant.slug
        ? lookups.bySlug.get(normalizeLookupKey(restaurant.slug))
        : undefined) ??
      lookups.byName.get(normalizeLookupKey(restaurant.name));

    const cityCentroid = restaurant.city
      ? lookups.cityCentroids.get(normalizeLookupKey(restaurant.city))
      : undefined;

    const delivery_links = restaurant.delivery_links?.length
      ? restaurant.delivery_links
      : bundledMatch?.delivery_links;
    const reservation_links = restaurant.reservation_links?.length
      ? restaurant.reservation_links
      : bundledMatch?.reservation_links;

    return {
      ...restaurant,
      google_maps_url: restaurant.google_maps_url ?? bundledMatch?.google_maps_url,
      apple_maps_url: restaurant.apple_maps_url ?? bundledMatch?.apple_maps_url,
      description_de: pickBundledText(restaurant.description_de, bundledMatch?.description_de),
      description_en: pickBundledText(restaurant.description_en, bundledMatch?.description_en),
      description_es: pickBundledText(restaurant.description_es, bundledMatch?.description_es),
      latitude:
        restaurant.latitude ?? bundledMatch?.latitude ?? cityCentroid?.latitude,
      longitude:
        restaurant.longitude ?? bundledMatch?.longitude ?? cityCentroid?.longitude,
      ...(delivery_links?.length ? { delivery_links } : {}),
      ...(reservation_links?.length ? { reservation_links } : {}),
    };
  });
}

/** Supabase-Einträge überschreiben Bundle; fehlende Länder (z. B. DE) bleiben aus dem Bundle. */
export function mergeBundledWithRemote(remote: Restaurant[]): Restaurant[] {
  const enrichedRemote = enrichRestaurantsFromBundle(remote);
  const byId = new Map<string, Restaurant>();

  for (const restaurant of bundledData.restaurants as Restaurant[]) {
    byId.set(restaurant.id, restaurant);
  }
  for (const restaurant of enrichedRemote) {
    byId.set(restaurant.id, restaurant);
  }

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
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
        remoteRestaurants = enrichRestaurantsFromBundle(parsed.restaurants);
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
      .eq('verification_status', 'verified')
      .order('name');

    if (error) {
      throw error;
    }

    const restaurants = enrichRestaurantsFromBundle(
      ((data ?? []) as SupabaseRestaurantRow[])
        .map(mapSupabaseRestaurantRow)
        .sort((a, b) => a.name.localeCompare(b.name, 'es')),
    );

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

/** Cache laden; Supabase-Sync läuft danach im Hintergrund (UI nicht blockieren). */
export async function bootstrapRestaurantData(): Promise<void> {
  if (bootstrapStarted) {
    return;
  }
  bootstrapStarted = true;

  await hydrateRestaurantCache();

  if (isSupabaseConfigured) {
    void syncRestaurantsFromSupabase();
  }
}
