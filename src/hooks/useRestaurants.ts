/**
 * useRestaurants — Daten-Hook für Restaurant-Listen
 *
 * Lädt die statische JSON-Datei plus Admin-Overrides (AsyncStorage).
 */

import { useCallback, useEffect, useState } from 'react';

import { useAdminStore } from '../store/adminStore';
import type { Restaurant } from '../types/Restaurant';
import { getMergedRestaurants } from '../utils/restaurantDataService';

type UseRestaurantsResult = {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useRestaurants(): UseRestaurantsResult {
  const dataRevision = useAdminStore((state) => state.dataRevision);
  const adminHydrated = useAdminStore((state) => state.hasHydrated);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      setRestaurants(getMergedRestaurants());
      setLoading(false);
    } catch (caughtError) {
      setError('Restaurants konnten nicht geladen werden.');
      setLoading(false);
      throw caughtError;
    }
  }, []);

  useEffect(() => {
    if (!adminHydrated) {
      return;
    }
    refetch().catch((caughtError: unknown) => {
      console.warn('Restaurants konnten nicht geladen werden:', caughtError);
      setError('Restaurants konnten nicht geladen werden.');
      setLoading(false);
    });
  }, [refetch, dataRevision, adminHydrated]);

  return { restaurants, loading, error, refetch };
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return getMergedRestaurants().find((r) => r.id === id);
}

export function getRestaurantsByRegion(regionCode: string): Restaurant[] {
  return getMergedRestaurants().filter((r) => r.region_code === regionCode);
}
