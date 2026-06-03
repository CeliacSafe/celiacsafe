import * as StoreReview from 'expo-store-review';
import { Alert, Linking } from 'react-native';

import { getPlatformStoreUrl } from '../constants/storeUrls';
import i18n from '../i18n';

/**
 * Native In-App-Review (StoreReview) oder Fallback: Store-Seite im Browser.
 */
export async function requestAppStoreReview(): Promise<void> {
  const available = await StoreReview.isAvailableAsync();
  if (available) {
    await StoreReview.requestReview();
    return;
  }

  const storeUrl = getPlatformStoreUrl();
  try {
    const canOpen = await Linking.canOpenURL(storeUrl);
    if (canOpen) {
      await Linking.openURL(storeUrl);
      return;
    }
  } catch (error) {
    console.error('Store URL open failed:', error);
  }

  Alert.alert(i18n.t('common.error'), i18n.t('profile.rate_not_available'));
}
