-- CeliacSafe — MFA/AAL2 in RLS erzwingen
--
-- Bisher war MFA nur in der admin-web-UI erzwungen; die REST/RPC-API akzeptierte
-- AAL1-Tokens. Diese Migration verlangt AAL2 für Staff-/Admin-Schreib- und
-- Lesezugriffe, sobald der Nutzer einen verifizierten TOTP-Faktor besitzt.
--
-- Muster (Supabase-Empfehlung "enforce MFA for users that have it"):
--   - Nutzer MIT verifiziertem Faktor → nur AAL2 erlaubt
--   - Nutzer OHNE Faktor → AAL1 erlaubt (damit Erst-Einrichtung möglich bleibt;
--     die admin-web-UI erzwingt die Einrichtung vor dem Zugriff)

create or replace function public.has_satisfied_mfa()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select array[coalesce(auth.jwt() ->> 'aal', 'aal1')] <@ (
    select case
      when count(*) > 0 then array['aal2']
      else array['aal1', 'aal2']
    end
    from auth.mfa_factors
    where auth.mfa_factors.user_id = auth.uid()
      and auth.mfa_factors.status = 'verified'
  );
$$;

-- is_admin()/is_staff() zusätzlich an MFA koppeln.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) and public.has_satisfied_mfa();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'editor')
  ) and public.has_satisfied_mfa();
$$;
