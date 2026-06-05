import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

/** Leichtes Feedback fuer Auswahl, Tabs, Filter-Pills, Heart-Toggle aus. */
export function hapticLight(): void {
  if (isWeb) {
    return;
  }
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** Mittleres Feedback fuer wichtige Aktionen (Filter zuruecksetzen). */
export function hapticMedium(): void {
  if (isWeb) {
    return;
  }
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
}

/** Erfolgs-Feedback (z. B. E-Mail-Vorschlag abgeschickt, Favorit gespeichert). */
export function hapticSuccess(): void {
  if (isWeb) {
    return;
  }
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

/** Fehler-Feedback (Standort verweigert, Mail nicht verfuegbar). */
export function hapticError(): void {
  if (isWeb) {
    return;
  }
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
}
