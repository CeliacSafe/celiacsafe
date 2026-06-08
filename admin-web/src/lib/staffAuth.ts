import type { Session } from '@supabase/supabase-js';

import { supabase } from './supabase';

export type AppRole = 'admin' | 'editor' | 'viewer';

export function isStaffRole(role: AppRole | null | undefined): role is 'admin' | 'editor' {
  return role === 'admin' || role === 'editor';
}

export function isAdminRole(role: AppRole | null | undefined): role is 'admin' {
  return role === 'admin';
}

export async function fetchProfileRole(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Profil-Rolle konnte nicht geladen werden:', error.message);
    return null;
  }

  return (data?.role as AppRole | undefined) ?? null;
}

export async function resolveStaffAccess(session: Session | null): Promise<{
  role: AppRole | null;
  isStaff: boolean;
}> {
  if (!session) {
    return { role: null, isStaff: false };
  }

  const role = await fetchProfileRole(session.user.id);
  return { role, isStaff: isStaffRole(role) };
}
