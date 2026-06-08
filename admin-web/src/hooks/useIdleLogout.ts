import { useEffect } from 'react';

/** Automatische Abmeldung nach Inaktivität (Admin-Web). */
export const IDLE_LOGOUT_MS = 30 * 60 * 1000;

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;

export function useIdleLogout(onIdle: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const resetTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        onIdle();
      }, IDLE_LOGOUT_MS);
    };

    resetTimer();

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, resetTimer, { passive: true });
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        resetTimer();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, resetTimer);
      }
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, onIdle]);
}
