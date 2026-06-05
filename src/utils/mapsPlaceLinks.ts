/**
 * Deeplinks zu Google Maps / Apple Maps (Unternehmensprofil).
 * Koordinaten dienen nur der eingebetteten Karte; extern öffnen wir
 * bevorzugt gespeicherte Profil-URLs oder eine Ortssuche (Name + Adresse).
 */

import { Platform } from 'react-native';

import type { Restaurant } from '../types/Restaurant';
import { openUrl } from './openExternalUrl';

export function normalizeExternalUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Suchbegriff: Name + Adresse (öffnet in Maps eher das Profil als reine Koordinaten). */
export function formatMapsSearchQuery(restaurant: Restaurant): string {
  const countryLabel = restaurant.country_code === 'ES' ? 'España' : restaurant.country_code;
  return [
    restaurant.name,
    restaurant.address_street,
    restaurant.postal_code,
    restaurant.city,
    restaurant.province,
    restaurant.region_name,
    countryLabel,
  ]
    .filter(Boolean)
    .join(', ');
}

export function resolveGoogleMapsPlaceUrl(restaurant: Restaurant): string | null {
  const stored = restaurant.google_maps_url?.trim();
  if (stored) {
    return normalizeExternalUrl(stored);
  }

  const query = formatMapsSearchQuery(restaurant);
  if (!query.replace(/,/g, '').trim()) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function resolveAppleMapsPlaceUrl(restaurant: Restaurant): string | null {
  const stored = restaurant.apple_maps_url?.trim();
  if (stored) {
    if (/^(maps|http|https):/i.test(stored)) {
      return stored;
    }
    return normalizeExternalUrl(stored);
  }

  const name = restaurant.name;
  const addressParts = [
    restaurant.address_street,
    restaurant.postal_code,
    restaurant.city,
    restaurant.region_name,
  ].filter(Boolean);

  if (restaurant.latitude != null && restaurant.longitude != null) {
    return `https://maps.apple.com/?ll=${restaurant.latitude},${restaurant.longitude}&q=${encodeURIComponent(name)}`;
  }

  if (addressParts.length === 0) {
    return null;
  }

  return `https://maps.apple.com/?q=${encodeURIComponent(name)}&address=${encodeURIComponent(addressParts.join(', '))}`;
}

/** Plattformpassender Maps-Deeplink (Profil-URL > Ortssuche). */
export function resolveMapsPlaceUrl(restaurant: Restaurant): string | null {
  if (Platform.OS === 'ios') {
    return resolveAppleMapsPlaceUrl(restaurant) ?? resolveGoogleMapsPlaceUrl(restaurant);
  }
  if (Platform.OS === 'web') {
    return resolveGoogleMapsPlaceUrl(restaurant);
  }
  return resolveGoogleMapsPlaceUrl(restaurant) ?? resolveAppleMapsPlaceUrl(restaurant);
}

export function canOpenExternalMaps(restaurant: Restaurant): boolean {
  return resolveMapsPlaceUrl(restaurant) != null;
}

export function openMapsPlace(restaurant: Restaurant): void {
  const url = resolveMapsPlaceUrl(restaurant);
  if (!url) {
    return;
  }
  openUrl(url).catch(() => undefined);
}
