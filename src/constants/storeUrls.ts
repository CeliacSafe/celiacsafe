import { Platform } from 'react-native';

/** TODO M12: echte App-Store-ID nach Veroeffentlichung eintragen (z. B. id1234567890). */
const APP_STORE_ID = '';

export const APP_STORE_URL = APP_STORE_ID
  ? `https://apps.apple.com/app/${APP_STORE_ID}`
  : null;

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.celiacsafe';

/** Öffentliche Web-Adresse als Fallback, solange ein Store-Listing fehlt. */
export const WEBSITE_URL = 'https://celiacsafe.vercel.app';

/**
 * Store-Listing-URL der aktuellen Plattform, oder null wenn (noch) keins existiert
 * (z. B. iOS vor Veröffentlichung). Für Review-Fallback verwenden.
 */
export function getPlatformStoreUrl(): string | null {
  return Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
}

/** Immer eine funktionierende URL zum Teilen — Store-Listing oder Website. */
export function getShareUrl(): string {
  return getPlatformStoreUrl() ?? WEBSITE_URL;
}
