-- Speisekarten-URL (PDF oder Webseite)
alter table public.restaurants
  add column if not exists menu_url text;
