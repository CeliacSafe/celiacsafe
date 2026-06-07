/**
 * CeliacSafe — Restaurant-Typdefinitionen
 *
 * Zentrale TypeScript-Strukturen für glutenfreie Lokale.
 * Alle Typen werden von JSON-Quelldaten, Hooks und UI-Komponenten gemeinsam genutzt.
 */

// ─── Hilfs-Typen (String-Literal-Unions) ─────────────────────────────────────

/** ISO-ähnlicher Ländercode für unterstützte Märkte. */
export type CountryCode = 'ES' | 'PT' | 'IT' | 'FR' | 'DE' | 'AT' | 'CH' | 'GB';

/** Autonome Gemeinschaft / Region (ISO 3166-2). */
export type RegionCode =
  | 'ES-AN'
  | 'ES-AR'
  | 'ES-AS'
  | 'ES-CN'
  | 'ES-CB'
  | 'ES-CL'
  | 'ES-CM'
  | 'ES-CT'
  | 'ES-EX'
  | 'ES-GA'
  | 'ES-IB'
  | 'ES-RI'
  | 'ES-MD'
  | 'ES-MC'
  | 'ES-NC'
  | 'ES-PV'
  | 'ES-VC'
  | 'ES-CE'
  | 'ES-ML'
  | 'DE-BW'
  | 'DE-BY'
  | 'DE-BE'
  | 'DE-BB'
  | 'DE-HB'
  | 'DE-HH'
  | 'DE-HE'
  | 'DE-MV'
  | 'DE-NI'
  | 'DE-NW'
  | 'DE-RP'
  | 'DE-SL'
  | 'DE-SN'
  | 'DE-ST'
  | 'DE-SH'
  | 'DE-TH';

/** Art des Lokals — bestimmt Icon, Kategorie-Filter und Suchvorschläge. */
export type VenueType =
  | 'restaurant'
  | 'cafe'
  | 'bakery'
  | 'pastry_shop'
  | 'ice_cream'
  | 'pizzeria'
  | 'bar_tapas'
  | 'fast_food'
  | 'hotel_restaurant'
  | 'food_truck'
  | 'catering'
  | 'brunch_place'
  | 'burger_joint'
  | 'asian_restaurant';

/** Preisklasse von günstig (€) bis gehoben (€€€€). */
export type PriceRange = '€' | '€€' | '€€€' | '€€€€';

/** Verfügbare Mahlzeiten / Tageszeiten am Lokal. */
export type MealType = 'breakfast' | 'brunch' | 'lunch' | 'dinner' | 'snacks' | 'drinks';

/**
 * Verifizierungsstatus — wie verlässlich ist die Glutenfreiheit bestätigt?
 * Nur `verified`-Lokale erscheinen standardmäßig in der App.
 */
export type VerificationStatus =
  | 'to_be_verified'
  | 'pending_verification'
  | 'in_verification'
  | 'verified'
  | 'rejected';

/** Wie wurde die Glutenfreiheit verifiziert? */
export type VerificationMethod =
  | 'own_visit'
  | 'phone_confirmed'
  | 'email_confirmed'
  | 'face_certified'
  | 'regional_assoc_certified'
  | 'operator_declaration'
  | 'multiple_sources';

/** Lieferdienst, über den das Lokal erreichbar ist. */
export type DeliveryPlatform =
  | 'glovo'
  | 'just_eat'
  | 'uber_eats'
  | 'wolt'
  | 'lieferando'
  | 'foodora'
  | 'deliveroo'
  | 'takeaway'
  | 'bolt_food'
  | 'own_delivery'
  | 'no_delivery';

/** Reservierungs- oder Bestellkanal des Lokals. */
export type ReservationPlatform =
  | 'thefork'
  | 'opentable'
  | 'quandoo'
  | 'booking_restaurants'
  | 'own_website'
  | 'phone_only'
  | 'walk_in_only'
  | 'instagram_dm';

// ─── Sub-Interfaces ──────────────────────────────────────────────────────────

/**
 * Verknüpfung zu einem Lieferdienst.
 * Ein Lokal kann mehrere Plattformen gleichzeitig nutzen (z. B. Glovo und Uber Eats).
 */
export interface DeliveryLink {
  platform: DeliveryPlatform;
  url: string;
  is_active: boolean;
}

/**
 * Verknüpfung zu einem Reservierungskanal.
 * Enthält die Plattform, den direkten Link und ob der Kanal aktuell genutzt wird.
 */
export interface ReservationLink {
  platform: ReservationPlatform;
  url: string;
  is_active: boolean;
}

/**
 * Kern-Datenstruktur für ein glutenfreies Lokal.
 * Entspricht einem Eintrag in `src/data/restaurants.json`.
 *
 * Pflichtfelder (ohne `?`) müssen in jeder JSON-Zeile vorhanden sein.
 * Optionale Felder können fehlen, wenn die Information noch nicht bekannt ist.
 */
export interface Restaurant {
  // ── Pflichtfelder ──
  id: string;
  name: string;
  country_code: CountryCode;
  region_code: RegionCode;
  region_name: string;
  city: string;
  verification_status: VerificationStatus;

  // ── Optionale Felder ──
  slug?: string;
  province?: string;
  district?: string;
  postal_code?: string;
  address_street?: string;
  latitude?: number;
  longitude?: number;
  /** Google-Maps-Profil (Teilen-Link vom Unternehmen). */
  google_maps_url?: string;
  /** Apple-Maps-Profil (Teilen-Link vom Unternehmen). */
  apple_maps_url?: string;
  venue_type?: VenueType;
  cuisine_types?: string[];
  price_range?: PriceRange;
  meal_types?: MealType[];
  verification_methods?: VerificationMethod[];
  last_verified_at?: string;
  face_program?: boolean;
  aoecs_certified?: boolean;
  national_authority?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  menu_url?: string;
  instagram?: string;
  facebook?: string;
  opening_hours?: string;
  seasonal_closure?: string;
  description_es?: string;
  description_en?: string;
  description_de?: string;
  featured_image_url?: string;
  /** Premiumpartner — in der Stadt zuerst in Listen (Admin-Tool). */
  is_premium_partner?: boolean;
  delivery_links?: DeliveryLink[];
  reservation_links?: ReservationLink[];
}
