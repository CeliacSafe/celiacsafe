import type { PlatformLink } from '../types/restaurant';

const HTTP_URL = /^https?:\/\/.+/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RestaurantFormInput = {
  name: string;
  city: string;
  region_code: string;
  region_name: string;
  latitude: string;
  longitude: string;
  email: string;
  website: string;
  menu_url: string;
  google_maps_url: string;
  apple_maps_url: string;
  featured_image_url: string;
};

function optionalHttpUrl(value: string, label: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (!HTTP_URL.test(trimmed)) {
    return `${label}: gültige http(s)-URL erforderlich.`;
  }
  return null;
}

export function validateRestaurantForm(form: RestaurantFormInput): string | null {
  if (form.name.trim().length < 2 || form.name.trim().length > 200) {
    return 'Name: 2–200 Zeichen erforderlich.';
  }
  if (form.city.trim().length < 2 || form.city.trim().length > 100) {
    return 'Stadt: 2–100 Zeichen erforderlich.';
  }
  if (!form.region_code.trim()) {
    return 'Regionscode ist Pflicht.';
  }
  if (!form.region_name.trim()) {
    return 'Regionsname ist Pflicht.';
  }

  if (form.latitude.trim()) {
    const lat = Number(form.latitude);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      return 'Breitengrad muss zwischen -90 und 90 liegen.';
    }
  }
  if (form.longitude.trim()) {
    const lng = Number(form.longitude);
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      return 'Längengrad muss zwischen -180 und 180 liegen.';
    }
  }

  const email = form.email.trim();
  if (email && !EMAIL.test(email)) {
    return 'E-Mail-Format ungültig.';
  }

  return (
    optionalHttpUrl(form.website, 'Website') ??
    optionalHttpUrl(form.menu_url, 'Speisekarte') ??
    optionalHttpUrl(form.google_maps_url, 'Google Maps') ??
    optionalHttpUrl(form.apple_maps_url, 'Apple Maps') ??
    optionalHttpUrl(form.featured_image_url, 'Bild-URL')
  );
}

export function validatePlatformLinks(links: PlatformLink[]): string | null {
  for (const link of links) {
    const url = link.url.trim();
    if (!url) {
      continue;
    }
    if (!HTTP_URL.test(url)) {
      return `Link «${link.platform}»: gültige http(s)-URL erforderlich.`;
    }
    if (url.length > 2000) {
      return `Link «${link.platform}»: URL zu lang (max. 2000 Zeichen).`;
    }
  }
  return null;
}
