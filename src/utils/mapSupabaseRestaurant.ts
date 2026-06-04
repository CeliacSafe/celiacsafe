import type { DeliveryLink, ReservationLink, Restaurant } from '../types/Restaurant';

const RESTAURANT_FIELDS = [
  'id',
  'name',
  'slug',
  'country_code',
  'region_code',
  'region_name',
  'province',
  'city',
  'district',
  'postal_code',
  'address_street',
  'latitude',
  'longitude',
  'venue_type',
  'cuisine_types',
  'price_range',
  'meal_types',
  'verification_status',
  'verification_methods',
  'last_verified_at',
  'face_program',
  'aoecs_certified',
  'national_authority',
  'phone',
  'whatsapp',
  'email',
  'website',
  'menu_url',
  'instagram',
  'facebook',
  'opening_hours',
  'seasonal_closure',
  'description_es',
  'description_en',
  'description_de',
  'featured_image_url',
] as const;

type LinkRow = { platform: string; url: string; is_active: boolean };

export type SupabaseRestaurantRow = Record<string, unknown> & {
  delivery_links?: LinkRow[] | null;
  reservation_links?: LinkRow[] | null;
};

function slimValue(value: unknown): unknown {
  if (value == null || value === '') {
    return undefined;
  }
  if (Array.isArray(value) && value.length === 0) {
    return undefined;
  }
  return value;
}

function mapLinks<T extends DeliveryLink | ReservationLink>(rows: LinkRow[] | null | undefined): T[] {
  if (!rows?.length) {
    return [];
  }
  return rows
    .filter((row) => row.is_active !== false && row.url?.trim())
    .map((row) => ({
      platform: row.platform,
      url: row.url,
      is_active: row.is_active ?? true,
    })) as T[];
}

/** DB-Zeile (inkl. verschachtelter Links) → App-Restaurant. */
export function mapSupabaseRestaurantRow(row: SupabaseRestaurantRow): Restaurant {
  const out: Record<string, unknown> = {};

  for (const key of RESTAURANT_FIELDS) {
    const value = slimValue(row[key]);
    if (value !== undefined) {
      out[key] = value;
    }
  }

  const delivery = mapLinks<DeliveryLink>(row.delivery_links);
  if (delivery.length) {
    out.delivery_links = delivery;
  }

  const reservation = mapLinks<ReservationLink>(row.reservation_links);
  if (reservation.length) {
    out.reservation_links = reservation;
  }

  return out as unknown as Restaurant;
}
