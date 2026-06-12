import { Platform } from 'react-native';

/** Pfade, die direkt zu einer Restaurant-Detailseite fuehren. */
const RESTAURANT_DEEP_LINK = /\/(?:map\/|favorites\/|community\/)?restaurant\/[^/]+/;

function extractPath(url: string): string {
  const withoutScheme = url.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*/i, '');
  return withoutScheme.startsWith('/') ? withoutScheme : `/${withoutScheme}`;
}

export function isRestaurantDeepLinkUrl(url: string): boolean {
  const path = extractPath(url);
  return RESTAURANT_DEEP_LINK.test(path) || RESTAURANT_DEEP_LINK.test(url);
}

/** Web: synchroner Check fuer Deep-Links ohne Async-Ladeblitz. */
export function isWebRestaurantDeepLink(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }
  return RESTAURANT_DEEP_LINK.test(window.location.pathname);
}
