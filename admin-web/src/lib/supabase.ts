import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase: VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY fehlen in admin-web/.env',
  );
}

/** Browser-Client (entspricht Supabase-Wizard „createBrowserClient“, ohne Next.js). */
export const createClient = () =>
  createBrowserClient(supabaseUrl ?? '', supabaseKey ?? '');

export const supabase = createClient();

export type RestaurantRow = {
  id: string;
  name: string;
  city: string;
  region_code: string;
  region_name: string;
  verification_status: string;
  is_published: boolean;
  is_hidden: boolean;
  is_premium_partner: boolean;
  updated_at: string;
};

export type SubmissionRow = {
  id: string;
  restaurant_name: string;
  city: string;
  status: string;
  submitted_at: string;
  submitted_by_email: string | null;
  submission_notes: string | null;
};
