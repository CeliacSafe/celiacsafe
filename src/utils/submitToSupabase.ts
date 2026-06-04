import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { SubmissionData } from './submitViaEmail';

/** Speichert einen Restaurant-Vorschlag in Supabase (anon insert). */
export async function submitRestaurantToSupabase(data: SubmissionData): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  const id = `sub_app_${Date.now()}`;

  const { error } = await supabase.from('submissions').insert({
    id,
    restaurant_name: data.restaurantName,
    city: data.city,
    country_code: 'ES',
    address: data.address ?? null,
    website: data.website ?? null,
    phone: data.contactInfo ?? null,
    submission_notes: data.notes ?? null,
    submitted_by_email: data.submitterEmail ?? null,
    submitted_by_name: data.submitterName ?? null,
    source: 'app',
    status: 'pending',
  });

  if (error) {
    console.warn('Supabase submission insert:', error.message);
    return false;
  }

  return true;
}
