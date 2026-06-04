import type { RestaurantSubmission, SubmissionStatus } from '../types/Submission';
import type { CountryCode, DeliveryLink, RegionCode, Restaurant } from '../types/Restaurant';
import { toCsv } from './csvParse';

const RESTAURANT_HEADERS = [
  'id',
  'name',
  'slug',
  'country_code',
  'region_code',
  'region_name',
  'city',
  'verification_status',
  'latitude',
  'longitude',
  'venue_type',
  'address_street',
  'postal_code',
  'phone',
  'website',
  'price_range',
  'cuisine_types',
  'description_es',
  'description_en',
  'description_de',
  'thefork_url',
  'glovo_url',
  'uber_eats_url',
] as const;

const SUBMISSION_HEADERS = [
  'id',
  'submitted_at',
  'submitted_by_email',
  'submitted_by_name',
  'restaurant_name',
  'city',
  'country_code',
  'address',
  'website',
  'phone',
  'submission_notes',
  'submission_status',
  'promoted_to_restaurant_id',
  'rejection_reason',
] as const;

function splitList(value: string | undefined): string[] | undefined {
  if (!value?.trim()) return undefined;
  const items = value
    .split(/[,;|]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

function parseFloatOrUndefined(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const n = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

function parseBool(value: string | undefined): boolean | undefined {
  if (!value?.trim()) return undefined;
  const v = value.trim().toUpperCase();
  if (['TRUE', '1', 'JA', 'YES', 'SI', 'SÍ'].includes(v)) return true;
  if (['FALSE', '0', 'NEIN', 'NO'].includes(v)) return false;
  return undefined;
}

export function csvRowToRestaurant(row: Record<string, string>): Restaurant | null {
  const id = row.id?.trim();
  const name = row.name?.trim();
  const countryCode = (row.country_code?.trim() || 'ES').toUpperCase();
  const regionCode = row.region_code?.trim();
  const regionName = row.region_name?.trim();
  const city = row.city?.trim();
  const verificationStatus = row.verification_status?.trim() || 'to_be_verified';

  if (!name || !city || !regionCode || !regionName) {
    return null;
  }

  const restaurantId =
    id ||
    `admin_${countryCode.toLowerCase()}_${regionCode.split('-').pop()?.toLowerCase()}_${Date.now()}`;

  const restaurant: Restaurant = {
    id: restaurantId,
    name,
    country_code: countryCode as CountryCode,
    region_code: regionCode as RegionCode,
    region_name: regionName,
    city,
    verification_status: verificationStatus as Restaurant['verification_status'],
  };

  if (row.slug?.trim()) restaurant.slug = row.slug.trim();
  const lat = parseFloatOrUndefined(row.latitude);
  const lng = parseFloatOrUndefined(row.longitude);
  if (lat != null) restaurant.latitude = lat;
  if (lng != null) restaurant.longitude = lng;
  if (row.venue_type?.trim()) restaurant.venue_type = row.venue_type.trim() as Restaurant['venue_type'];
  if (row.address_street?.trim()) restaurant.address_street = row.address_street.trim();
  if (row.postal_code?.trim()) restaurant.postal_code = row.postal_code.trim();
  if (row.phone?.trim()) restaurant.phone = row.phone.trim();
  if (row.website?.trim()) restaurant.website = row.website.trim();
  if (row.price_range?.trim()) restaurant.price_range = row.price_range.trim() as Restaurant['price_range'];
  const cuisines = splitList(row.cuisine_types);
  if (cuisines) restaurant.cuisine_types = cuisines;
  if (row.description_es?.trim()) restaurant.description_es = row.description_es.trim();
  if (row.description_en?.trim()) restaurant.description_en = row.description_en.trim();
  if (row.description_de?.trim()) restaurant.description_de = row.description_de.trim();

  const face = parseBool(row.face_program);
  if (face != null) restaurant.face_program = face;
  const aoecs = parseBool(row.aoecs_certified);
  if (aoecs != null) restaurant.aoecs_certified = aoecs;

  const deliveryLinks: DeliveryLink[] = [];
  if (row.glovo_url?.trim()) {
    deliveryLinks.push({ platform: 'glovo', url: row.glovo_url.trim(), is_active: true });
  }
  if (row.uber_eats_url?.trim()) {
    deliveryLinks.push({ platform: 'uber_eats', url: row.uber_eats_url.trim(), is_active: true });
  }
  if (deliveryLinks.length) restaurant.delivery_links = deliveryLinks;

  if (row.thefork_url?.trim()) {
    restaurant.reservation_links = [
      { platform: 'thefork', url: row.thefork_url.trim(), is_active: true },
    ];
  }

  return restaurant;
}

function mapSubmissionStatus(value: string | undefined): SubmissionStatus {
  const raw = (value ?? 'pending').trim().toLowerCase();
  if (raw === 'promoted' || raw === 'approved') return 'promoted';
  if (raw === 'rejected') return 'rejected';
  if (raw === 'in_review' || raw === 'in_verification') return 'in_review';
  return 'pending';
}

export function csvRowToSubmission(row: Record<string, string>): RestaurantSubmission | null {
  const restaurantName = row.restaurant_name?.trim() || row.name?.trim();
  const city = row.city?.trim();
  if (!restaurantName || !city) return null;

  const id = row.id?.trim() || `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    submittedAt: row.submitted_at?.trim() || new Date().toISOString(),
    submittedByEmail: row.submitted_by_email?.trim() || undefined,
    submittedByName: row.submitted_by_name?.trim() || undefined,
    restaurantName,
    city,
    countryCode: (row.country_code?.trim() || 'ES').toUpperCase(),
    address: row.address?.trim() || undefined,
    website: row.website?.trim() || undefined,
    phone: row.phone?.trim() || undefined,
    notes: row.submission_notes?.trim() || row.notes?.trim() || undefined,
    status: mapSubmissionStatus(row.submission_status),
    promotedToRestaurantId: row.promoted_to_restaurant_id?.trim() || undefined,
    rejectionReason: row.rejection_reason?.trim() || undefined,
    source: 'csv',
  };
}

export function restaurantToCsvRow(restaurant: Restaurant): Record<string, string> {
  const glovo = restaurant.delivery_links?.find((l) => l.platform === 'glovo')?.url ?? '';
  const uber = restaurant.delivery_links?.find((l) => l.platform === 'uber_eats')?.url ?? '';
  const thefork = restaurant.reservation_links?.find((l) => l.platform === 'thefork')?.url ?? '';

  return {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug ?? '',
    country_code: restaurant.country_code,
    region_code: restaurant.region_code,
    region_name: restaurant.region_name,
    city: restaurant.city,
    verification_status: restaurant.verification_status,
    latitude: restaurant.latitude != null ? String(restaurant.latitude) : '',
    longitude: restaurant.longitude != null ? String(restaurant.longitude) : '',
    venue_type: restaurant.venue_type ?? '',
    address_street: restaurant.address_street ?? '',
    postal_code: restaurant.postal_code ?? '',
    phone: restaurant.phone ?? '',
    website: restaurant.website ?? '',
    price_range: restaurant.price_range ?? '',
    cuisine_types: (restaurant.cuisine_types ?? []).join(', '),
    description_es: restaurant.description_es ?? '',
    description_en: restaurant.description_en ?? '',
    description_de: restaurant.description_de ?? '',
    thefork_url: thefork,
    glovo_url: glovo,
    uber_eats_url: uber,
  };
}

export function submissionToCsvRow(submission: RestaurantSubmission): Record<string, string> {
  return {
    id: submission.id,
    submitted_at: submission.submittedAt,
    submitted_by_email: submission.submittedByEmail ?? '',
    submitted_by_name: submission.submittedByName ?? '',
    restaurant_name: submission.restaurantName,
    city: submission.city,
    country_code: submission.countryCode,
    address: submission.address ?? '',
    website: submission.website ?? '',
    phone: submission.phone ?? '',
    submission_notes: submission.notes ?? '',
    submission_status: submission.status,
    promoted_to_restaurant_id: submission.promotedToRestaurantId ?? '',
    rejection_reason: submission.rejectionReason ?? '',
  };
}

export function restaurantsToCsv(restaurants: Restaurant[]): string {
  return toCsv([...RESTAURANT_HEADERS], restaurants.map(restaurantToCsvRow));
}

export function submissionsToCsv(submissions: RestaurantSubmission[]): string {
  return toCsv([...SUBMISSION_HEADERS], submissions.map(submissionToCsvRow));
}

export function detectCsvKind(headers: string[]): 'restaurants' | 'submissions' | 'unknown' {
  const set = new Set(headers);
  if (set.has('restaurant_name') || set.has('submission_notes') || set.has('submission_status')) {
    return 'submissions';
  }
  if (set.has('region_code') && set.has('name')) {
    return 'restaurants';
  }
  return 'unknown';
}
