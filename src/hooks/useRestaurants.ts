/**
 * useRestaurants — Daten-Hook für Restaurant-Listen
 *
 * Lädt die statische JSON-Datei `src/data/restaurants.json`, validiert jeden
 * Datensatz mit Zod und stellt typsichere Restaurant-Objekte für Screens bereit.
 * Die Validierung läuft asynchron, damit der Startbildschirm nicht blockiert.
 */

import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

import data from '../data/restaurants.json';
import type { Restaurant } from '../types/Restaurant';

const deliveryLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
  is_active: z.boolean().optional(),
});

const reservationLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
  is_active: z.boolean().optional(),
});

const restaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  country_code: z.string(),
  region_code: z.string(),
  region_name: z.string(),
  city: z.string(),
  verification_status: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  cuisine_types: z.array(z.string()).optional(),
  delivery_links: z.array(deliveryLinkSchema).optional(),
  reservation_links: z.array(reservationLinkSchema).optional(),
  slug: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  postal_code: z.string().optional(),
  address_street: z.string().optional(),
  venue_type: z.string().optional(),
  price_range: z.string().optional(),
  meal_types: z.array(z.string()).optional(),
  verification_methods: z.array(z.string()).optional(),
  last_verified_at: z.string().optional(),
  face_program: z.boolean().optional(),
  aoecs_certified: z.boolean().optional(),
  national_authority: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  opening_hours: z.string().optional(),
  seasonal_closure: z.string().optional(),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
  description_de: z.string().optional(),
  featured_image_url: z.string().optional(),
});

let cachedRestaurants: Restaurant[] | null = null;

function validateRestaurants(): Restaurant[] {
  if (cachedRestaurants) {
    return cachedRestaurants;
  }

  const validated: Restaurant[] = [];

  for (const item of data.restaurants) {
    const result = restaurantSchema.safeParse(item);
    if (result.success) {
      validated.push(result.data as Restaurant);
    } else {
      const id = typeof item === 'object' && item && 'id' in item ? String(item.id) : '?';
      console.warn('Ungültiger Datensatz übersprungen:', id, result.error);
    }
  }

  cachedRestaurants = validated;
  return validated;
}

type UseRestaurantsResult = {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useRestaurants(): UseRestaurantsResult {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 200));
    try {
      setRestaurants(validateRestaurants());
      setLoading(false);
    } catch (caughtError) {
      setError('Restaurants konnten nicht geladen werden.');
      setLoading(false);
      throw caughtError;
    }
  }, []);

  useEffect(() => {
    refetch().catch((caughtError: unknown) => {
      console.warn('Restaurants konnten nicht geladen werden:', caughtError);
      setError('Restaurants konnten nicht geladen werden.');
      setLoading(false);
    });
  }, [refetch]);

  return { restaurants, loading, error, refetch };
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return validateRestaurants().find((r) => r.id === id);
}

export function getRestaurantsByRegion(regionCode: string): Restaurant[] {
  return validateRestaurants().filter((r) => r.region_code === regionCode);
}
