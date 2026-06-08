-- Im Supabase Dashboard → SQL Editor ausführen (einmalig)
-- Oder: SUPABASE_DB_PASSWORD in .env setzen → npm run supabase:migrate

alter table public.restaurants
  add column if not exists menu_url text;

alter table public.restaurants
  add column if not exists google_maps_url text,
  add column if not exists apple_maps_url text;

comment on column public.restaurants.google_maps_url is
  'Google-Maps-Profil-URL (Teilen-Link vom Unternehmen)';
comment on column public.restaurants.apple_maps_url is
  'Apple-Maps-Profil-URL (Teilen-Link vom Unternehmen)';
