-- Zöliakie-spezifische Felder für Zertifizierung, Kategorie und Allergene
alter table public.restaurants
  add column if not exists is_certified boolean default false,
  add column if not exists category text check (
    category is null or category in ('restaurant', 'bakery', 'pizza', 'cafe', 'fastfood')
  ),
  add column if not exists allergens jsonb default '{}'::jsonb;

comment on column public.restaurants.is_certified is
  'Offiziell von Verband (FACE/DZG/AOECS) geprüft';
comment on column public.restaurants.category is
  'Vereinfachte Kategorie: restaurant | bakery | pizza | cafe | fastfood';
comment on column public.restaurants.allergens is
  'Begleit-Allergene: sin_lactosa, vegan, sin_trigo (JSON)';
