export type PlatformLink = {
  platform: string;
  url: string;
  is_active: boolean;
};

export type RestaurantDetail = {
  id: string;
  name: string;
  slug: string | null;
  country_code: string;
  region_code: string;
  region_name: string;
  province: string | null;
  city: string;
  district: string | null;
  postal_code: string | null;
  address_street: string | null;
  latitude: number | null;
  longitude: number | null;
  venue_type: string | null;
  cuisine_types: string[] | null;
  price_range: string | null;
  meal_types: string[] | null;
  verification_status: string;
  verification_methods: string[] | null;
  last_verified_at: string | null;
  face_program: boolean | null;
  aoecs_certified: boolean | null;
  national_authority: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  menu_url: string | null;
  instagram: string | null;
  facebook: string | null;
  opening_hours: string | null;
  seasonal_closure: string | null;
  description_es: string | null;
  description_en: string | null;
  description_de: string | null;
  featured_image_url: string | null;
  is_published: boolean;
  is_hidden: boolean;
};

export const VERIFICATION_STATUSES = [
  'to_be_verified',
  'pending_verification',
  'in_verification',
  'verified',
  'rejected',
] as const;

export const DELIVERY_PLATFORMS = [
  'glovo',
  'uber_eats',
  'just_eat',
  'lieferando',
  'wolt',
  'own_delivery',
] as const;

export const RESERVATION_PLATFORMS = [
  'thefork',
  'opentable',
  'own_website',
  'phone_only',
  'walk_in_only',
] as const;

export function parseList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatList(items: string[] | null | undefined): string {
  return items?.join(', ') ?? '';
}

export function linksToMap(links: PlatformLink[]): Record<string, PlatformLink> {
  const map: Record<string, PlatformLink> = {};
  for (const link of links) {
    map[link.platform] = link;
  }
  return map;
}

export function mapToLinkRows(
  map: Record<string, PlatformLink>,
  platforms: readonly string[],
): PlatformLink[] {
  return platforms.map((platform) => ({
    platform,
    url: map[platform]?.url ?? '',
    is_active: map[platform]?.is_active ?? true,
  }));
}
