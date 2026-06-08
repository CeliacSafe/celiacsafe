/**
 * In-App-Admin nur im Dev-Build (PIN-geschützt, clientseitig — nicht für Production).
 * Production-Administration: admin-web mit Supabase Auth.
 */
export const IN_APP_ADMIN_ENABLED = __DEV__;

/** Nur relevant wenn IN_APP_ADMIN_ENABLED — nie in Release-Builds setzen. */
export const ADMIN_PIN = __DEV__ ? '4829' : '';

/** 5× Tippen auf Versionszeile im Profil öffnet Admin-Login (nur Dev). */
export const ADMIN_UNLOCK_TAPS = 5;
