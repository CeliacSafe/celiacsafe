-- CeliacSafe — Security hardening (RLS, Rollen, Submissions-Validierung)

-- ─── Rollen-Hilfsfunktionen ─────────────────────────────────────────────────

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
  );
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
  );
$$;

-- ─── Profile: Rolle darf nicht selbst geändert werden ───────────────────────

drop policy if exists profiles_update_own on public.profiles;

create policy profiles_update_own on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role is not distinct from (
      select p.role from public.profiles p where p.id = auth.uid()
    )
  );

drop policy if exists profiles_admin_all on public.profiles;

create policy profiles_admin_all on public.profiles
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─── Staff vs. Admin auf Datentabellen ──────────────────────────────────────

drop policy if exists restaurants_admin_all on public.restaurants;

create policy restaurants_staff_all on public.restaurants
  for all
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists delivery_links_admin_all on public.delivery_links;

create policy delivery_links_staff_all on public.delivery_links
  for all
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists reservation_links_admin_all on public.reservation_links;

create policy reservation_links_staff_all on public.reservation_links
  for all
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists submissions_admin_all on public.submissions;

create policy submissions_staff_read on public.submissions
  for select
  using (public.is_staff());

drop policy if exists submissions_admin_update on public.submissions;

create policy submissions_staff_update on public.submissions
  for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists submissions_admin_delete on public.submissions;

create policy submissions_admin_delete on public.submissions
  for delete
  using (public.is_admin());

-- ─── Submissions: Insert mit Feldvalidierung ────────────────────────────────

drop policy if exists submissions_insert_public on public.submissions;

create policy submissions_insert_public on public.submissions
  for insert
  with check (
    char_length(trim(restaurant_name)) between 2 and 200
    and char_length(trim(city)) between 2 and 100
    and char_length(coalesce(submitted_by_email, '')) <= 254
    and char_length(coalesce(submitted_by_name, '')) <= 120
    and char_length(coalesce(address, '')) <= 500
    and char_length(coalesce(website, '')) <= 500
    and char_length(coalesce(phone, '')) <= 40
    and char_length(coalesce(submission_notes, '')) <= 2000
    and char_length(id) between 8 and 64
    and status = 'pending'
    and source in ('app', 'web', 'admin')
  );

-- ─── Neuregistrierung: viewer (kein Schreibzugriff bis Admin zuweist) ───────

alter table public.profiles alter column role set default 'viewer';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'viewer',
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  return new;
end;
$$;
