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
