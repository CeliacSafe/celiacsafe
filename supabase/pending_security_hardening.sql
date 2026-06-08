-- Security-Migrationen 005–008 (einmalig im SQL Editor ausfuehren)
-- Reihenfolge: 005 → 006 → 007 → 008
-- Projekt: https://supabase.com/dashboard/project/ltlblmwjnbcqwenxdrfh/sql/new

-- ─── 005_add_viewer_role.sql ───

-- Neue Rolle ohne Schreibrechte (muss vor 006 in separatem Schritt laufen)
alter type public.app_role add value if not exists 'viewer';


-- ─── 006_security_hardening.sql ───

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


-- ─── 007_submission_rate_limit.sql ───

-- Rate Limiting für öffentliche Submissions (Spam-Schutz)

create or replace function public.enforce_submission_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  email_limit constant int := 3;
  email_window constant interval := '24 hours';
  global_limit constant int := 30;
  global_window constant interval := '1 hour';
  duplicate_window constant interval := '1 hour';
begin
  -- Pro E-Mail (case-insensitive, 24 h)
  if new.submitted_by_email is not null and btrim(new.submitted_by_email) <> '' then
    if (
      select count(*)
      from public.submissions s
      where lower(btrim(s.submitted_by_email)) = lower(btrim(new.submitted_by_email))
        and s.submitted_at > now() - email_window
    ) >= email_limit then
      raise exception 'submission_rate_limit_email' using errcode = 'P0001';
    end if;
  end if;

  -- Global für App-Quelle (Schutz vor Massen-Inserts ohne E-Mail)
  if new.source = 'app' then
    if (
      select count(*)
      from public.submissions s
      where s.source = 'app'
        and s.submitted_at > now() - global_window
    ) >= global_limit then
      raise exception 'submission_rate_limit_global' using errcode = 'P0001';
    end if;
  end if;

  -- Duplikat: gleicher Name + Stadt innerhalb 1 h
  if (
    select count(*)
    from public.submissions s
    where lower(btrim(s.restaurant_name)) = lower(btrim(new.restaurant_name))
      and lower(btrim(s.city)) = lower(btrim(new.city))
      and s.submitted_at > now() - duplicate_window
  ) >= 1 then
    raise exception 'submission_rate_limit_duplicate' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists submissions_rate_limit on public.submissions;

create trigger submissions_rate_limit
  before insert on public.submissions
  for each row
  execute function public.enforce_submission_rate_limit();


-- ─── 008_audit_and_staff_submissions.sql ───

-- Audit-Log, updated_by, Staff-Submissions, Rate-Limit-Ausnahme für Staff

-- ─── updated_by automatisch setzen ──────────────────────────────────────────

create or replace function public.set_record_updated_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    new.updated_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists restaurants_set_updated_by on public.restaurants;

create trigger restaurants_set_updated_by
  before update on public.restaurants
  for each row
  execute function public.set_record_updated_by();

-- ─── Audit-Log (Insert/Update/Delete) ───────────────────────────────────────

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rid text;
  payload jsonb;
begin
  if tg_op = 'DELETE' then
    rid := old.id::text;
    payload := to_jsonb(old);
    insert into public.audit_log (table_name, record_id, action, changed_by, payload)
    values (tg_table_name, rid, lower(tg_op), auth.uid(), payload);
    return old;
  end if;

  rid := new.id::text;
  if tg_op = 'UPDATE' then
    payload := jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new));
  else
    payload := to_jsonb(new);
  end if;

  insert into public.audit_log (table_name, record_id, action, changed_by, payload)
  values (tg_table_name, rid, lower(tg_op), auth.uid(), payload);
  return new;
end;
$$;

drop trigger if exists restaurants_audit on public.restaurants;
create trigger restaurants_audit
  after insert or update or delete on public.restaurants
  for each row
  execute function public.write_audit_log();

drop trigger if exists submissions_audit on public.submissions;
create trigger submissions_audit
  after insert or update or delete on public.submissions
  for each row
  execute function public.write_audit_log();

drop trigger if exists delivery_links_audit on public.delivery_links;
create trigger delivery_links_audit
  after insert or update or delete on public.delivery_links
  for each row
  execute function public.write_audit_log();

drop trigger if exists reservation_links_audit on public.reservation_links;
create trigger reservation_links_audit
  after insert or update or delete on public.reservation_links
  for each row
  execute function public.write_audit_log();

-- ─── Staff darf Submissions direkt anlegen (CSV-Import) ─────────────────────

drop policy if exists submissions_staff_insert on public.submissions;

create policy submissions_staff_insert on public.submissions
  for insert
  with check (public.is_staff());

-- ─── Rate Limit: Staff/Admin ausnehmen ──────────────────────────────────────

create or replace function public.enforce_submission_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  email_limit constant int := 3;
  email_window constant interval := '24 hours';
  global_limit constant int := 30;
  global_window constant interval := '1 hour';
  duplicate_window constant interval := '1 hour';
begin
  if auth.uid() is not null and public.is_staff() then
    return new;
  end if;

  if new.submitted_by_email is not null and btrim(new.submitted_by_email) <> '' then
    if (
      select count(*)
      from public.submissions s
      where lower(btrim(s.submitted_by_email)) = lower(btrim(new.submitted_by_email))
        and s.submitted_at > now() - email_window
    ) >= email_limit then
      raise exception 'submission_rate_limit_email' using errcode = 'P0001';
    end if;
  end if;

  if new.source = 'app' then
    if (
      select count(*)
      from public.submissions s
      where s.source = 'app'
        and s.submitted_at > now() - global_window
    ) >= global_limit then
      raise exception 'submission_rate_limit_global' using errcode = 'P0001';
    end if;
  end if;

  if (
    select count(*)
    from public.submissions s
    where lower(btrim(s.restaurant_name)) = lower(btrim(new.restaurant_name))
      and lower(btrim(s.city)) = lower(btrim(new.city))
      and s.submitted_at > now() - duplicate_window
  ) >= 1 then
    raise exception 'submission_rate_limit_duplicate' using errcode = 'P0001';
  end if;

  return new;
end;
$$;
