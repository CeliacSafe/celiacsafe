import type {
  DeliveryLink,
  DeliveryPlatform,
  ReservationLink,
  ReservationPlatform,
  Restaurant,
} from '../types/Restaurant';

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isUsableUrl(url: string | undefined): boolean {
  return Boolean(url?.trim());
}

const DELIVERY_PLATFORM_ALIASES: Record<string, DeliveryPlatform> = {
  uber_eats: 'uber_eats',
  'uber eats': 'uber_eats',
  ubereats: 'uber_eats',
  just_eat: 'just_eat',
  'just eat': 'just_eat',
  justeat: 'just_eat',
  lieferando: 'lieferando',
  own_delivery: 'own_delivery',
  own_delivery_page: 'own_delivery',
  own_order_page: 'own_delivery',
  own_takeaway: 'own_delivery',
  own_online_shop: 'own_delivery',
  own_order: 'own_delivery',
  own_orders: 'own_delivery',
  'own_order_/_pickup': 'own_delivery',
};

/** Excel-/DB-Varianten → kanonischer Plattform-Code (wie scripts/platform_urls.py). */
export function normalizeDeliveryPlatform(platform: string): DeliveryPlatform {
  const raw = platform.trim().toLowerCase().replace(/-/g, '_');
  if (!raw) {
    return 'own_delivery';
  }
  const underscored = raw.replace(/\s+/g, '_');
  return (
    DELIVERY_PLATFORM_ALIASES[raw] ??
    DELIVERY_PLATFORM_ALIASES[underscored] ??
    (underscored as DeliveryPlatform)
  );
}

function searchQuery(restaurant: Restaurant): string {
  return [restaurant.name, restaurant.city].filter(Boolean).join(' ').trim();
}

/** Karten-Tab: keine Suche-spezifischen Tabs/Diät-Filter, damit Pins sichtbar bleiben. */
export function toMapFilterCriteria<T extends { categoryTab?: unknown; minRating?: unknown; dietVegan?: boolean; dietVegetarian?: boolean }>(
  criteria: T
): Omit<T, 'categoryTab' | 'minRating' | 'dietVegan' | 'dietVegetarian'> {
  const { categoryTab: _c, minRating: _r, dietVegan: _v, dietVegetarian: _g, ...mapCriteria } = criteria;
  return mapCriteria;
}

export function buildTheForkUrl(restaurant: Restaurant, explicitUrl?: string): string {
  if (isUsableUrl(explicitUrl)) {
    return normalizeUrl(explicitUrl!);
  }
  const q = encodeURIComponent(searchQuery(restaurant));
  if (restaurant.slug?.trim()) {
    return `https://www.thefork.es/restaurant/${encodeURIComponent(restaurant.slug.trim())}`;
  }
  return `https://www.thefork.es/buscar?query=${q}`;
}

export function buildGlovoUrl(restaurant: Restaurant, explicitUrl?: string): string {
  if (isUsableUrl(explicitUrl)) {
    return normalizeUrl(explicitUrl!);
  }
  const q = encodeURIComponent(searchQuery(restaurant));
  return `https://glovoapp.com/es/search?query=${q}`;
}

export function buildUberEatsUrl(restaurant: Restaurant, explicitUrl?: string): string {
  if (isUsableUrl(explicitUrl)) {
    return normalizeUrl(explicitUrl!);
  }
  const q = encodeURIComponent(searchQuery(restaurant));
  return `https://www.ubereats.com/es/search?q=${q}`;
}

const DELIVERY_BUILDERS: Partial<
  Record<DeliveryPlatform, (r: Restaurant, url?: string) => string>
> = {
  glovo: buildGlovoUrl,
  uber_eats: buildUberEatsUrl,
  just_eat: (r, url) =>
    isUsableUrl(url)
      ? normalizeUrl(url!)
      : `https://www.just-eat.es/buscar?q=${encodeURIComponent(searchQuery(r))}`,
  wolt: (r, url) =>
    isUsableUrl(url) ? normalizeUrl(url!) : `https://wolt.com/es/search?q=${encodeURIComponent(searchQuery(r))}`,
  deliveroo: (r, url) =>
    isUsableUrl(url)
      ? normalizeUrl(url!)
      : `https://deliveroo.es/es/search?query=${encodeURIComponent(searchQuery(r))}`,
};

const RESERVATION_BUILDERS: Partial<
  Record<ReservationPlatform, (r: Restaurant, url?: string) => string>
> = {
  thefork: buildTheForkUrl,
  opentable: (r, url) =>
    isUsableUrl(url)
      ? normalizeUrl(url!)
      : `https://www.opentable.es/s?term=${encodeURIComponent(searchQuery(r))}`,
  quandoo: (r, url) =>
    isUsableUrl(url)
      ? normalizeUrl(url!)
      : `https://www.quandoo.es/resultados?query=${encodeURIComponent(searchQuery(r))}`,
  own_website: (r, url) =>
    isUsableUrl(url) ? normalizeUrl(url!) : r.website ? normalizeUrl(r.website) : '',
};

export function resolveDeliveryUrl(restaurant: Restaurant, link: DeliveryLink): string | null {
  const platform = normalizeDeliveryPlatform(link.platform);
  if (link.is_active === false || platform === 'no_delivery') {
    return null;
  }
  if (platform === 'own_delivery') {
    if (isUsableUrl(link.url)) {
      return normalizeUrl(link.url);
    }
    if (restaurant.website?.trim()) {
      return normalizeUrl(restaurant.website);
    }
    return null;
  }
  const builder = DELIVERY_BUILDERS[platform];
  if (builder) {
    const url = builder(restaurant, link.url);
    return url || null;
  }
  if (isUsableUrl(link.url)) {
    return normalizeUrl(link.url);
  }
  return null;
}

export function resolveReservationUrl(restaurant: Restaurant, link: ReservationLink): string | null {
  if (link.is_active === false) {
    return null;
  }
  if (link.platform === 'walk_in_only' || link.platform === 'phone_only' || link.platform === 'instagram_dm') {
    return null;
  }
  const builder = RESERVATION_BUILDERS[link.platform];
  if (builder) {
    const url = builder(restaurant, link.url);
    return url || null;
  }
  if (isUsableUrl(link.url)) {
    return normalizeUrl(link.url);
  }
  return null;
}

export function getActiveDeliveryLinks(restaurant: Restaurant): DeliveryLink[] {
  return (restaurant.delivery_links ?? [])
    .map((link) => ({
      ...link,
      platform: normalizeDeliveryPlatform(link.platform),
    }))
    .filter(
      (link) =>
        link.is_active !== false &&
        link.platform !== 'no_delivery' &&
        resolveDeliveryUrl(restaurant, link) != null
    );
}

export function restaurantHasDelivery(restaurant: Restaurant): boolean {
  return getActiveDeliveryLinks(restaurant).length > 0;
}

export function getActiveReservationLinks(restaurant: Restaurant): ReservationLink[] {
  return (restaurant.reservation_links ?? []).filter((link) => {
    if (link.is_active === false) return false;
    if (link.platform === 'walk_in_only') return true;
    if (link.platform === 'phone_only') return Boolean(restaurant.phone?.trim());
    return resolveReservationUrl(restaurant, link) != null;
  });
}

export function restaurantHasMapCoordinates(restaurant: Restaurant): boolean {
  return restaurant.latitude != null && restaurant.longitude != null;
}
