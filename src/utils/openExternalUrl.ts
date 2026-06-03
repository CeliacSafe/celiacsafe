/**
 * Zentrale Linking-Helfer fuer externe URLs (Telefon, Web, WhatsApp, Maps, Social).
 *
 * Alle Detail- und Kontakt-Aktionen in M06+ nutzen diese Funktionen, damit
 * plattformspezifische URL-Formate und typische Stolpersteine (Sonderzeichen,
 * App-vs.-Browser-Fallback) an einer Stelle behandelt werden.
 */

import { Alert, Linking, Platform } from 'react-native';

import i18n from '../i18n';

/**
 * Oeffnet eine URL extern. Prueft vorher, ob die URL geoeffnet werden kann.
 */
export async function openUrl(url: string): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(i18n.t('common.error'), i18n.t('errors.cannot_open_url', { url }));
    }
  } catch (error) {
    console.error('openUrl failed:', error);
    Alert.alert(i18n.t('common.error'), i18n.t('errors.link_open_failed'));
  }
}

/**
 * Telefonanruf oeffnen.
 */
export function openPhone(phone: string): void {
  const cleaned = phone.replace(/[^+0-9]/g, '');
  openUrl(`tel:${cleaned}`).catch(() => undefined);
}

/**
 * WhatsApp-Chat oeffnen mit optional vorbefuellter Nachricht.
 */
export function openWhatsApp(phone: string, message?: string): void {
  const cleaned = phone.replace(/[^+0-9]/g, '');
  const url = message
    ? `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${cleaned}`;
  openUrl(url).catch(() => undefined);
}

/**
 * E-Mail-App oeffnen.
 */
export function openEmail(email: string, subject?: string): void {
  const url = subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;
  openUrl(url).catch(() => undefined);
}

/**
 * System-Maps mit Routing-Plan oeffnen. Plattform-spezifisch.
 */
export function openMapsRouting(latitude: number, longitude: number, label?: string): void {
  const labelParam = label ? encodeURIComponent(label) : '';
  const url = Platform.select({
    ios: `maps:?ll=${latitude},${longitude}&q=${labelParam}`,
    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${labelParam})`,
    default: `https://maps.google.com/?q=${latitude},${longitude}`,
  }) as string;
  openUrl(url).catch(() => undefined);
}

/**
 * Instagram-Profil oeffnen. Versucht zuerst die App, faellt auf Web zurueck.
 */
export function openInstagram(handle: string): void {
  const cleaned = handle.replace(/^@/, '');
  Linking.canOpenURL(`instagram://user?username=${cleaned}`)
    .then((supported) => {
      const url = supported
        ? `instagram://user?username=${cleaned}`
        : `https://instagram.com/${cleaned}`;
      return openUrl(url);
    })
    .catch(() => undefined);
}

/**
 * Facebook-Seite oeffnen.
 */
export function openFacebook(handle: string): void {
  const cleaned = handle.replace(/^@/, '');
  openUrl(`https://facebook.com/${cleaned}`).catch(() => undefined);
}
