-- CeliacSafe — Supabase EU Schema (Frankfurt / eu-central-1)
-- Ausführen im Supabase SQL Editor oder via: supabase db push

-- ─── Rollen ─────────────────────────────────────────────────────────────────

create type public.app_role as enum ('admin', 'editor');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'editor',
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Restaurants ────────────────────────────────────────────────────────────

create table public.restaurants (
  id text primary key,
  name text not null,
  slug text,
  country_code text not null default 'ES',
  region_code text not null,
  region_name text not null,
  province text,
  city text not null,
  district text,
  postal_code text,
  address_street text,
  latitude double precision,
  longitude double precision,
  venue_type text,
  cuisine_types text[] default '{}',
  price_range text,
  meal_types text[] default '{}',
  verification_status text not null default 'to_be_verified',
  verification_methods text[] default '{}',
  last_verified_at date,
  face_program boolean default false,
  aoecs_certified boolean default false,
  national_authority text,
  phone text,
  whatsapp text,
  email text,
  website text,
  menu_url text,
  instagram text,
  facebook text,
  opening_hours text,
  seasonal_closure text,
  description_es text,
  description_en text,
  description_de text,
  featured_image_url text,
  is_published boolean not null default true,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

create index restaurants_city_idx on public.restaurants (city);
create index restaurants_region_idx on public.restaurants (region_code);
create index restaurants_published_idx on public.restaurants (is_published, is_hidden);

-- ─── Liefer- & Reservierungslinks ───────────────────────────────────────────

create table public.delivery_links (
  id bigint generated always as identity primary key,
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  platform text not null,
  url text not null default '',
  is_active boolean not null default true,
  last_checked date,
  notes text,
  unique (restaurant_id, platform)
);

create table public.reservation_links (
  id bigint generated always as identity primary key,
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  platform text not null,
  url text not null default '',
  is_active boolean not null default true,
  last_checked date,
  notes text,
  unique (restaurant_id, platform)
);

-- ─── Nutzer-Vorschläge ──────────────────────────────────────────────────────

create type public.submission_status as enum (
  'pending',
  'in_review',
  'promoted',
  'rejected'
);

create table public.submissions (
  id text primary key,
  submitted_at timestamptz not null default now(),
  submitted_by_email text,
  submitted_by_name text,
  restaurant_name text not null,
  city text not null,
  country_code text not null default 'ES',
  address text,
  website text,
  phone text,
  submission_notes text,
  status public.submission_status not null default 'pending',
  promoted_to_restaurant_id text references public.restaurants (id),
  rejection_reason text,
  source text not null default 'app',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index submissions_status_idx on public.submissions (status);

-- ─── Audit (optional, leichtgewichtig) ─────────────────────────────────────

create table public.audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id text not null,
  action text not null,
  changed_by uuid references auth.users (id),
  payload jsonb,
  created_at timestamptz not null default now()
);

-- ─── updated_at Trigger ─────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger restaurants_updated_at
  before update on public.restaurants
  for each row execute function public.set_updated_at();

create trigger submissions_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─── Hilfsfunktion: Admin-Check ─────────────────────────────────────────────

create or replace function public.is_admin()
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

-- ─── Row Level Security ─────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.delivery_links enable row level security;
alter table public.reservation_links enable row level security;
alter table public.submissions enable row level security;
alter table public.audit_log enable row level security;

-- Profile: eigener Datensatz lesen; Admins alles
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- Restaurants: App (anon) liest nur veröffentlichte; Admins voller Zugriff
create policy restaurants_public_read on public.restaurants
  for select using (
    is_published = true
    and is_hidden = false
    and verification_status <> 'rejected'
  );

create policy restaurants_admin_all on public.restaurants
  for all using (public.is_admin()) with check (public.is_admin());

-- Links: öffentlich lesbar wenn Restaurant öffentlich
create policy delivery_links_public_read on public.delivery_links
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id
        and r.is_published = true
        and r.is_hidden = false
        and r.verification_status <> 'rejected'
    )
  );

create policy delivery_links_admin_all on public.delivery_links
  for all using (public.is_admin()) with check (public.is_admin());

create policy reservation_links_public_read on public.reservation_links
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id
        and r.is_published = true
        and r.is_hidden = false
        and r.verification_status <> 'rejected'
    )
  );

create policy reservation_links_admin_all on public.reservation_links
  for all using (public.is_admin()) with check (public.is_admin());

-- Submissions: jeder darf einreichen (anon); nur Admins lesen/bearbeiten
create policy submissions_insert_public on public.submissions
  for insert with check (true);

create policy submissions_admin_all on public.submissions
  for select using (public.is_admin());

create policy submissions_admin_update on public.submissions
  for update using (public.is_admin()) with check (public.is_admin());

create policy submissions_admin_delete on public.submissions
  for delete using (public.is_admin());

-- Audit: nur Admins
create policy audit_log_admin on public.audit_log
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── View für App-Export (JSON-Shape) ───────────────────────────────────────

create or replace view public.restaurants_app_export as
select
  r.*,
  coalesce(
    (
      select json_agg(json_build_object(
        'platform', d.platform,
        'url', d.url,
        'is_active', d.is_active
      ) order by d.platform)
      from public.delivery_links d
      where d.restaurant_id = r.id and d.is_active = true
    ),
    '[]'::json
  ) as delivery_links,
  coalesce(
    (
      select json_agg(json_build_object(
        'platform', rv.platform,
        'url', rv.url,
        'is_active', rv.is_active
      ) order by rv.platform)
      from public.reservation_links rv
      where rv.restaurant_id = r.id and rv.is_active = true
    ),
    '[]'::json
  ) as reservation_links
from public.restaurants r
where r.is_published = true and r.is_hidden = false;
