/**
 * useRestaurants — Supabase-Sync mit Offline-Cache und Bundled-Fallback
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import {
  bootstrapRestaurantData,
  getRestaurantSyncState,
  subscribeRestaurantSync,
  syncRestaurantsFromSupabase,
} from '../services/restaurantSync';
import { useAdminStore } from '../store/adminStore';
import type { Restaurant } from '../types/Restaurant';
import { getMergedRestaurants } from '../utils/restaurantDataService';

type UseRestaurantsResult = {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
  lastSyncedAt: string | null;
  dataSource: 'remote' | 'cache' | 'bundle';
  refetch: () => Promise<void>;
};

export function useRestaurants(): UseRestaurantsResult {
  const dataRevision = useAdminStore((state) => state.dataRevision);
  const adminHydrated = useAdminStore((state) => state.hasHydrated);
  const syncState = useSyncExternalStore(subscribeRestaurantSync, getRestaurantSyncState);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  const applyMerged = useCallback(() => {
    setRestaurants(getMergedRestaurants());
  }, []);

  const refetch = useCallback(async () => {
    setError(null);
    const ok = await syncRestaurantsFromSupabase();
    applyMerged();
    if (!ok && !getMergedRestaurants().length) {
      setError('Restaurants konnten nicht geladen werden.');
    }
  }, [applyMerged]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await bootstrapRestaurantData();
      if (!cancelled) {
        applyMerged();
        setLoading(false);
        setBootstrapped(true);
        if (getMergedRestaurants().length === 0) {
          setError('Restaurants konnten nicht geladen werden.');
        }
      }
    })().catch((caughtError: unknown) => {
      console.warn('Restaurant-Bootstrap:', caughtError);
      if (!cancelled) {
        setError('Restaurants konnten nicht geladen werden.');
        setLoading(false);
        setBootstrapped(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [applyMerged]);

  useEffect(() => {
    if (!adminHydrated || !bootstrapped) {
      return;
    }
    applyMerged();
  }, [adminHydrated, bootstrapped, dataRevision, syncState.source, syncState.lastSyncedAt, applyMerged]);

  return {
    restaurants,
    loading: loading || !adminHydrated,
    error,
    syncing: syncState.syncing,
    lastSyncedAt: syncState.lastSyncedAt,
    dataSource: syncState.source,
    refetch,
  };
}

export function useRestaurantById(id: string) {
  const { restaurants, loading, error, refetch } = useRestaurants();
  const restaurant = restaurants.find((r) => r.id === id);
  return { restaurant, loading, error, refetch };
}

/** @deprecated Nutze useRestaurantById in Screens für reaktive Updates nach Sync. */
export function getRestaurantById(id: string): Restaurant | undefined {
  return getMergedRestaurants().find((r) => r.id === id);
}

export function getRestaurantsByRegion(regionCode: string): Restaurant[] {
  return getMergedRestaurants().filter((r) => r.region_code === regionCode);
}
