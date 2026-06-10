-- CeliacSafe — RLS für internes Migrations-Tracking (Supabase Lint: rls_disabled_in_public)

alter table if exists public._celiacsafe_migrations enable row level security;

-- Keine Policies: anon/authenticated haben keinen Zugriff.
-- Service-Role (Migrations-Skripte) umgeht RLS weiterhin.

revoke all on table public._celiacsafe_migrations from anon, authenticated;
