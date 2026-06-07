export const MIN_PASSWORD_LENGTH = 12;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

const ATTEMPTS_KEY = 'celiacsafe_admin_login_attempts';

type AttemptState = {
  count: number;
  lockedUntil: number | null;
};

/**
 * Persistenz über localStorage (überlebt Reload/neue Tabs) statt sessionStorage.
 * Dies ist eine clientseitige UX-Bremse; die verbindliche serverseitige
 * Drosselung übernimmt Supabase Auth (siehe docs/SECURITY.md).
 */
function getStore(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

function readAttempts(): AttemptState {
  const store = getStore();
  if (!store) {
    return { count: 0, lockedUntil: null };
  }
  try {
    const raw = store.getItem(ATTEMPTS_KEY);
    if (!raw) {
      return { count: 0, lockedUntil: null };
    }
    const parsed = JSON.parse(raw) as AttemptState;
    if (typeof parsed.count !== 'number') {
      return { count: 0, lockedUntil: null };
    }
    return parsed;
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function writeAttempts(state: AttemptState): void {
  const store = getStore();
  if (!store) {
    return;
  }
  try {
    store.setItem(ATTEMPTS_KEY, JSON.stringify(state));
  } catch {
    /* Storage voll oder gesperrt — Lockout ist nur Best-Effort. */
  }
}

export function validatePasswordLength(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.`;
  }
  return null;
}

export function getLoginLockout(): { locked: boolean; retryAfterMs?: number } {
  const state = readAttempts();
  if (!state.lockedUntil) {
    return { locked: false };
  }

  const remaining = state.lockedUntil - Date.now();
  if (remaining <= 0) {
    writeAttempts({ count: 0, lockedUntil: null });
    return { locked: false };
  }

  return { locked: true, retryAfterMs: remaining };
}

export function recordFailedLogin(): { locked: boolean; attemptsLeft: number } {
  const state = readAttempts();
  const nextCount = state.count + 1;

  if (nextCount >= MAX_LOGIN_ATTEMPTS) {
    writeAttempts({ count: nextCount, lockedUntil: Date.now() + LOGIN_LOCKOUT_MS });
    return { locked: true, attemptsLeft: 0 };
  }

  writeAttempts({ count: nextCount, lockedUntil: null });
  return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - nextCount };
}

export function clearLoginAttempts(): void {
  getStore()?.removeItem(ATTEMPTS_KEY);
}
