import * as Haptics from 'expo-haptics';

/** Leichtes Feedback fuer Auswahl, Tabs, Filter-Pills, Heart-Toggle aus. */
export function hapticLight(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** Mittleres Feedback fuer wichtige Aktionen (Filter zuruecksetzen). */
export function hapticMedium(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
}

/** Erfolgs-Feedback (z. B. E-Mail-Vorschlag abgeschickt, Favorit gespeichert). */
export function hapticSuccess(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

/** Fehler-Feedback (Standort verweigert, Mail nicht verfuegbar). */
export function hapticError(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
}
