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
