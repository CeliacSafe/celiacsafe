import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@celiacsafe/submission_cooldown';
/** Mindestabstand zwischen App-Vorschlägen pro Gerät (zusätzlich zu DB-Rate-Limits). */
export const SUBMISSION_COOLDOWN_MS = 5 * 60 * 1000;

export async function checkSubmissionCooldown(): Promise<{
  allowed: boolean;
  retryAfterMs?: number;
}> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { allowed: true };
    }

    const lastSent = Number(raw);
    if (Number.isNaN(lastSent)) {
      return { allowed: true };
    }

    const elapsed = Date.now() - lastSent;
    if (elapsed >= SUBMISSION_COOLDOWN_MS) {
      return { allowed: true };
    }

    return { allowed: false, retryAfterMs: SUBMISSION_COOLDOWN_MS - elapsed };
  } catch {
    return { allowed: true };
  }
}

export async function markSubmissionSent(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Gerätespeicher optional — kein harter Fehler
  }
}
