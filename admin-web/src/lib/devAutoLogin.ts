import { getDevAutoLoginCredentials } from './devAuthBypass';
import { supabase } from './supabase';

/** Einmaliges Auto-Login für localhost-Dev (Credentials aus admin-web/.env). */
export async function ensureDevAutoLogin(): Promise<void> {
  const credentials = getDevAutoLoginCredentials();
  if (!credentials) {
    return;
  }

  const { data } = await supabase.auth.getSession();
  if (data.session) {
    return;
  }

  const { error } = await supabase.auth.signInWithPassword(credentials);
  if (error) {
    console.warn('[dev] Auto-Login fehlgeschlagen:', error.message);
  }
}
