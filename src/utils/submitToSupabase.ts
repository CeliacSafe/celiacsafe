import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { mapSubmissionInsertError, type SubmissionErrorReason } from './submissionErrors';
import { checkSubmissionCooldown, markSubmissionSent } from './submissionCooldown';
import { parseSubmissionData } from './submissionSchema';
import type { SubmissionData } from './submitViaEmail';

export type { SubmissionErrorReason };

export type SubmissionResult =
  | { ok: true }
  | { ok: false; reason: SubmissionErrorReason | 'rate_limit_client' };

function buildSubmissionId(): string {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `sub_app_${Date.now()}_${suffix}`.slice(0, 64);
}

/** Speichert einen Restaurant-Vorschlag in Supabase (anon insert). */
export async function submitRestaurantToSupabase(
  data: SubmissionData
): Promise<SubmissionResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, reason: 'unknown' };
  }

  const validated = parseSubmissionData(data);
  if (!validated) {
    return { ok: false, reason: 'validation' };
  }

  const cooldown = await checkSubmissionCooldown();
  if (!cooldown.allowed) {
    return { ok: false, reason: 'rate_limit_client' };
  }

  const id = buildSubmissionId();

  const { error } = await supabase.from('submissions').insert({
    id,
    restaurant_name: validated.restaurantName,
    city: validated.city,
    country_code: validated.countryCode ?? 'ES',
    address: validated.address ?? null,
    website: validated.website ?? null,
    phone: validated.contactInfo ?? null,
    submission_notes: validated.notes ?? null,
    submitted_by_email: validated.submitterEmail ?? null,
    submitted_by_name: validated.submitterName ?? null,
    source: 'app',
    status: 'pending',
  });

  if (error) {
    console.warn('Supabase submission insert:', error.message);
    return { ok: false, reason: mapSubmissionInsertError(error.message) };
  }

  await markSubmissionSent();
  return { ok: true };
}
