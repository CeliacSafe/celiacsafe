import { Platform } from 'react-native';

/** TODO M12: echte App-Store-ID nach Veroeffentlichung eintragen */
export const APP_STORE_URL = 'https://apps.apple.com/app/idXXXXXXX';

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.celiacsafe';

/** Store-Listing-URL der aktuellen Plattform (Teilen + Review-Fallback). */
export function getPlatformStoreUrl(): string {
  return Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
}
