# CeliacSafe — Excel-Spaltenliste (Web-Admin)

Spaltenköpfe **Zeile 1**, exakt **snake_case**. Daten ab **Zeile 2**.  
Entspricht dem Web-Admin (`admin-web` → Restaurant bearbeiten) und `scripts/excel-to-json.py`.

**Leere Excel-Datei:** `data-source/CeliacSafe_Datenbank_v4.xlsx` — erzeugen mit `npm run data:excel-template`  
**CSV-Kopfzeilen:** `data-source/templates/` (ein Blatt pro Datei)

Legende: **P** = Pflicht · **E** = stark empfohlen · **O** = optional

---

## Blatt `restaurants` (eine Zeile = ein Lokal)

Kopfzeile (Spaltenreihenfolge):

```
id	name	slug	country_code	region_code	region_name	province	city	district	postal_code	address_street	latitude	longitude	google_maps_url	apple_maps_url	venue_type	cuisine_types	price_range	meal_types	verification_status	verification_methods	last_verified_at	face_program	aoecs_certified	national_authority	phone	whatsapp	email	website	menu_url	instagram	facebook	opening_hours	seasonal_closure	description_de	description_en	description_es	featured_image_url	is_published	is_hidden	thefork_url	glovo_url	uber_eats_url	just_eat_url
```

| Spalte | P/E/O | Format / erlaubte Werte |
|--------|-------|-------------------------|
| `id` | **P** | Eindeutig, stabil: `es_{region}_{nr}` z. B. `es_md_001` |
| `name` | **P** | Offizieller Anzeigename |
| `slug` | E | Klein, Bindestriche: `as-de-bastos-madrid` |
| `country_code` | **P** | `ES` (aktueller Scope) |
| `region_code` | **P** | ISO 3166-2:ES, z. B. `ES-MD`, `ES-IB` |
| `region_name` | **P** | z. B. `Comunidad de Madrid` |
| `province` | E | Provinz / Insel |
| `city` | **P** | Stadt / Ort |
| `district` | O | Stadtteil |
| `postal_code` | E | PLZ |
| `address_street` | E | Straße + Hausnummer |
| `latitude` | E | Dezimalgrad (Punkt) — nur für die **Mini-Karte** in der App |
| `longitude` | E | Dezimalgrad, Spanien ca. -10–4 |
| `google_maps_url` | E | Teilen-Link vom **Google-Maps-Profil** (`https://www.google.com/maps/place/…`) |
| `apple_maps_url` | E | Teilen-Link vom **Apple-Maps-Eintrag** (`https://maps.apple.com/…`) |
| `venue_type` | E | `restaurant`, `cafe`, `bakery`, `pastry_shop`, `ice_cream`, `pizzeria`, `bar_tapas`, `fast_food`, `hotel_restaurant`, `food_truck`, `catering`, `brunch_place`, `burger_joint`, `asian_restaurant` |
| `cuisine_types` | E | Kommagetrennt: `mediterranea, espanola` |
| `price_range` | E | `€`, `€€`, `€€€`, `€€€€` |
| `meal_types` | E | Kommagetrennt: `breakfast`, `brunch`, `lunch`, `dinner`, `snacks`, `drinks` |
| `verification_status` | **P** | `to_be_verified`, `pending_verification`, `in_verification`, `verified`, `rejected` |
| `verification_methods` | E | Kommagetrennt: `own_visit`, `phone_confirmed`, `email_confirmed`, `face_certified`, `regional_assoc_certified`, `operator_declaration`, `multiple_sources` |
| `last_verified_at` | E | Datum `YYYY-MM-DD` |
| `face_program` | E | `TRUE` / `FALSE` |
| `aoecs_certified` | E | `TRUE` / `FALSE` |
| `national_authority` | O | Text |
| `phone` | E | Telefon |
| `whatsapp` | O | WhatsApp |
| `email` | O | E-Mail |
| `website` | E | URL |
| `menu_url` | E | Speisekarte (PDF/Web), volle URL |
| `instagram` | O | Profil/URL |
| `facebook` | O | Profil/URL |
| `opening_hours` | E | Freitext Öffnungszeiten |
| `seasonal_closure` | O | z. B. Winterpause |
| `description_de` | E | Kurzbeschreibung DE |
| `description_en` | E | Kurzbeschreibung EN |
| `description_es` | E | Kurzbeschreibung ES |
| `featured_image_url` | O | Bild-URL; leer = Typ-Foto in App |
| `is_published` | E | `TRUE` / `FALSE` — App zeigt nur `TRUE` |
| `is_hidden` | E | `TRUE` / `FALSE` — `TRUE` = ausgeblendet |
| `thefork_url` | O | Inline-URL (Alternative zu Blatt `reservation_links`) |
| `glovo_url` | O | Inline-URL (Alternative zu `delivery_links`) |
| `uber_eats_url` | O | Inline-URL |
| `just_eat_url` | O | Inline-URL |

**App-Sichtbarkeit (Supabase-Sync):** `is_published=TRUE`, `is_hidden=FALSE`, `verification_status` ≠ `rejected`.

---

## Blatt `delivery_links` (mehrere Zeilen pro Restaurant möglich)

Kopfzeile:

```
id	restaurant_id	restaurant_name	platform	url	is_active	last_checked	notes
```

| Spalte | P/E/O | Format |
|--------|-------|--------|
| `id` | **P** | Eindeutig, z. B. `dlv_001` |
| `restaurant_id` | **P** | Muss in `restaurants.id` existieren |
| `restaurant_name` | O | Nur zur Kontrolle (Lesbarkeit) |
| `platform` | **P** | `glovo`, `uber_eats`, `just_eat`, `wolt`, `lieferando`, `foodora`, `takeaway`, `bolt_food`, `own_delivery`, `no_delivery` |
| `url` | E | `https://…` oder leer (Export ergänzt Suche) |
| `is_active` | E | `TRUE` / `FALSE` |
| `last_checked` | O | `YYYY-MM-DD` |
| `notes` | O | Recherche-Notiz (nicht in App) |

**Web-Admin** pflegt dieselben Plattformen (Subset): `glovo`, `uber_eats`, `just_eat`, `lieferando`, `wolt`, `own_delivery`.

---

## Blatt `reservation_links` (mehrere Zeilen pro Restaurant möglich)

Kopfzeile:

```
id	restaurant_id	restaurant_name	platform	url	is_active	last_checked	notes
```

| Spalte | P/E/O | Format |
|--------|-------|--------|
| `id` | **P** | z. B. `rsv_001` |
| `restaurant_id` | **P** | Muss in `restaurants.id` existieren |
| `restaurant_name` | O | Kontrolle |
| `platform` | **P** | `thefork`, `opentable`, `quandoo`, `booking_restaurants`, `own_website`, `phone_only`, `walk_in_only`, `instagram_dm` |
| `url` | E | Volle URL; bei `phone_only` / `walk_in_only` oft leer |
| `is_active` | E | `TRUE` / `FALSE` |
| `last_checked` | O | `YYYY-MM-DD` |
| `notes` | O | Recherche-Notiz |

**Web-Admin** (Subset): `thefork`, `opentable`, `own_website`, `phone_only`, `walk_in_only`.

---

## Blatt `submissions` (Community-Vorschläge, optional)

Kopfzeile:

```
id	restaurant_name	city	country_code	address	website	phone	submission_notes	submitted_by_email	submitted_by_name	submission_status	source	submitted_at
```

| Spalte | P/E/O | Format |
|--------|-------|--------|
| `id` | O | z. B. `sub_001` (sonst auto) |
| `restaurant_name` | **P** | Name des vorgeschlagenen Lokals |
| `city` | **P** | Stadt |
| `country_code` | O | Default `ES` |
| `address` | O | Adresse |
| `website` | O | URL |
| `phone` | O | Telefon |
| `submission_notes` | O | Notizen des Einreichers |
| `submitted_by_email` | O | E-Mail |
| `submitted_by_name` | O | Name |
| `submission_status` | O | `pending`, `in_review`, `promoted`, `rejected` |
| `source` | O | `app`, `csv`, … |
| `submitted_at` | O | ISO-Datum/Zeit |

Nach **Übernehmen** im Web-Admin: Restaurant in `restaurants` mit Minimaldaten anlegen → Rest in `restaurants`-Spalten pflegen.

---

## Blatt `lookups` (Referenz, keine App-Daten)

Eine Spalte pro Liste (ab Zeile 2 die erlaubten Werte):

```
country_code	country_name	region_code_es	region_name_es	venue_type	cuisine_type	price_range	meal_type	verification_status	verification_method	platform_delivery	platform_reservation	data_source_type	national_authority
```

---

## Schnell-Check vor Speichern / Export

- [ ] Pflichtfelder `restaurants` ausgefüllt  
- [ ] `restaurant_id` in Link-Blättern existiert  
- [ ] Koordinaten plausibel  
- [ ] `is_published=TRUE`, `is_hidden=FALSE` (wenn sichtbar)  
- [ ] `menu_url` / Website / TheFork wo bekannt  
- [ ] Listen kommagetrennt, ohne Leerzeichen am Ende  

**Export:** `npm run data:build` · **Supabase:** `npm run data:export-supabase` nach Web-Admin-Änderungen
