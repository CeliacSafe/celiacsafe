-- Premiumpartner: im Admin hinterlegt, in der App pro Stadt zuerst angezeigt

alter table public.restaurants
  add column if not exists is_premium_partner boolean not null default false;

create index if not exists restaurants_premium_city_idx
  on public.restaurants (city, is_premium_partner desc)
  where is_published = true and is_hidden = false and is_premium_partner = true;
