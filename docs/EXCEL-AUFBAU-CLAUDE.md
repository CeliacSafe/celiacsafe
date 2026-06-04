# CeliacSafe — Anweisungen für Claude (Excel-Datenbank)

Dieses Dokument kann als System-Prompt oder Aufgabenbeschreibung an Claude übergeben werden, wenn die Excel-Datei `CeliacSafe_Datenbank_v4.xlsx` angelegt, gepflegt oder erweitert werden soll.

**Projektpfad:** `C:\Dev\celiacsafe`  
**Zieldatei:** `data-source/CeliacSafe_Datenbank_v4.xlsx`  
**Export in die App:** `npm run data:build` → `src/data/restaurants.json`

---

## Deine Rolle

Du pflegst die **Master-Datenbank** für die CeliacSafe-App (100 % glutenfreie Restaurants in Spanien). Du arbeitest **nur in der Excel-Struktur** unten — keine freien Tabellen, keine zusätzlichen Blattnamen, keine abweichenden Spaltenüberschriften.

Spaltenköpfe: **Zeile 1**, exakt in **snake_case** (Kleinbuchstaben, Unterstriche), wie vorgegeben.  
Daten: **ab Zeile 2**.

---

## Datei & Blätter (Pflicht)

| Blatt | Zweck |
| ----- | ----- |
| `README` | Kurzbeschreibung der Datei (optional, wird nicht exportiert) |
| `lookups` | Erlaubte Werte / Referenzlisten (Validierung für Menschen & KI) |
| `restaurants` | **Haupttabelle** — ein Lokal pro Zeile |
| `delivery_links` | Lieferdienste (0–n Zeilen pro Restaurant) |
| `reservation_links` | Reservierung (0–n Zeilen pro Restaurant) |
| `submissions` | Community-Vorschläge (optional, nicht App-Export) |
| `statistics` | Statistik / Formeln (optional) |

Für den App-Export sind **`restaurants`**, **`delivery_links`** und **`reservation_links`** verbindlich.

---

## Blatt `lookups`

Referenzspalten (jeweils eine Spalte mit erlaubten Werten):

- `country_code`, `country_name`
- `region_code_es`, `region_name_es` — ISO 3166-2:ES (z. B. `ES-IB`, `ES-VC`, `ES-CT`, `ES-MD`)
- `venue_type` — siehe Liste unten
- `cuisine_type` — freie Küchen-Tags (klein, snake_case, z. B. `mediterranea`, `vegana`)
- `price_range` — `€`, `€€`, `€€€`, `€€€€`
- `meal_type` — `breakfast`, `brunch`, `lunch`, `dinner`, `snacks`, `drinks`
- `verification_status` — `pending_verification`, `to_be_verified`, `in_verification`, `verified`, `rejected` (Excel kann auch `closed_permanently` führen; nur exportierbare Status beachten)
- `verification_method` — `own_visit`, `phone_confirmed`, `email_confirmed`, `face_certified`, `regional_assoc_certified`, `operator_declaration`, `multiple_sources`
- `platform_delivery` — siehe Lieferplattformen
- `platform_reservation` — siehe Reservierungsplattformen
- `data_source_type`, `national_authority`

Neue Werte nur eintragen, wenn sie in der App (`src/types/Restaurant.ts`) vorgesehen sind oder vorher abgestimmt wurden.

---

## Blatt `restaurants`

### Pflichtfelder (jede Zeile)

| Spalte | Regel | Beispiel |
| ------ | ----- | -------- |
| `id` | Eindeutig, stabil, snake_case mit Präfix `es_{region}_{nr}` | `es_md_001` |
| `name` | Offizieller Anzeigename | `As de Bastos` |
| `country_code` | Immer `ES` (aktueller Scope) | `ES` |
| `region_code` | ISO 3166-2:ES | `ES-MD` |
| `region_name` | Lesbarer Regionsname | `Comunidad de Madrid` |
| `city` | Stadt / Ort | `Madrid` |
| `verification_status` | Siehe lookups | `to_be_verified` oder `verified` |

### Stark empfohlen (für App & Karte)

| Spalte | Regel |
| ------ | ----- |
| `slug` | URL-tauglich, klein, Bindestriche: `as-de-bastos-madrid` — für TheFork-URLs |
| `latitude`, `longitude` | Dezimalgrad (Punkt, nicht Komma); ohne Koordinaten kein Karten-Pin |
| `venue_type` | Ein Wert aus lookups |
| `address_street`, `postal_code`, `province` | Adresse |
| `phone`, `website`, `email` | Kontakt |
| `description_es`, `description_en`, `description_de` | Kurzbeschreibung pro Sprache |
| `cuisine_types` | Kommagetrennt: `mediterranea, espanola` |
| `meal_types` | Kommagetrennt: `lunch, dinner` |
| `price_range` | `€` bis `€€€€` |
| `face_program`, `aoecs_certified` | `TRUE` / `FALSE` |
| `last_verified_at` | Datum `YYYY-MM-DD` |

### Optionale Inline-URLs (überschreiben leere Link-Tabellen)

Diese Spalten **dürfen** im Blatt `restaurants` ergänzt werden (Vorrang vor leerer `url` in Link-Blättern):

- `thefork_url`
- `glovo_url`
- `uber_eats_url`
- `just_eat_url`

### ID-Konvention

```
es_{region_kurz}_{laufnummer}
```

- `es_ib_001` = Balearen, Restaurant 1  
- `es_ct_012` = Katalonien, Restaurant 12  
- **Niemals** IDs ändern, wenn das Lokal schon in der App/Favoriten existiert.

### `venue_type` (erlaubt)

`restaurant`, `cafe`, `bakery`, `pastry_shop`, `ice_cream`, `pizzeria`, `bar_tapas`, `fast_food`, `hotel_restaurant`, `food_truck`, `catering`, `brunch_place`, `burger_joint`, `asian_restaurant`

### `verification_status` (Export-Hinweis)

- In der Excel steht oft `pending_verification` → wird beim Export zu `to_be_verified` gemappt.
- `rejected` wird exportiert, erscheint aber in der App gefiltert.
- Für Produktion später: nur `verified` exportieren (`INCLUDE_PENDING_FOR_DEV` in `scripts/excel-to-json.py`).

---

## Blatt `delivery_links`

Eine Zeile = ein Lieferkanal für ein Restaurant.

| Spalte | Regel |
| ------ | ----- |
| `id` | Eindeutig, z. B. `dlv_001` |
| `restaurant_id` | **Muss** in `restaurants.id` existieren |
| `restaurant_name` | Nur zur Lesbarkeit (Kontrolle) |
| `platform` | Kanonischer Code — siehe unten |
| `url` | Volle `https://`-URL; **leer lassen**, wenn noch unbekannt (Pipeline ergänzt Suche) |
| `is_active` | `TRUE` / `FALSE` |
| `last_checked` | Datum der letzten Prüfung |
| `notes` | Recherche-Notiz (wird nicht in App exportiert) |

### Lieferplattformen (`platform`)

`glovo`, `uber_eats`, `just_eat`, `wolt`, `deliveroo`, `lieferando`, `foodora`, `takeaway`, `bolt_food`, `own_delivery`, `no_delivery`

- **`no_delivery`**: Lokal liefert nicht — trotzdem max. eine Zeile, `is_active=TRUE`.
- **`own_delivery`**: Eigener Shop/Web — `url` = Shop-URL (z. B. `https://celicioso.shop`).
- Mehrere Plattformen = **mehrere Zeilen** (gleiche `restaurant_id`).

### URL-Regeln Lieferung

1. **Beste Qualität:** exakte Restaurant-URL von Glovo/Uber Eats kopieren.  
2. **Unbekannt:** `platform` setzen, `url` leer, `notes` mit „URL prüfen …“. Beim Export entsteht automatisch eine **Such-URL** (Name + Stadt).  
3. Keine erfundenen Deep-Links — nur recherchierte oder leere URL + Notiz.

---

## Blatt `reservation_links`

Struktur wie `delivery_links`, IDs z. B. `rsv_001`.

### Reservierungsplattformen (`platform`)

`thefork`, `opentable`, `quandoo`, `booking_restaurants`, `own_website`, `phone_only`, `walk_in_only`, `instagram_dm`

| Plattform | `url` |
| --------- | ----- |
| `thefork` | TheFork-Restaurantseite oder leer (Auto: Slug/Suche) |
| `own_website` | Reservierungs- oder Website-URL |
| `phone_only` | `url` leer — App nutzt `restaurants.phone` |
| `walk_in_only` | `url` leer — nur Hinweis in App |
| `instagram_dm` | Profil-URL oder Handle in `notes` |

Mehrere Kanäle = mehrere Zeilen (z. B. TheFork + Telefon).

---

## Qualitäts-Checkliste (vor Export)

- [ ] Jede `restaurant_id` in Link-Blättern existiert in `restaurants`
- [ ] Keine doppelten `id` in `restaurants` / `delivery_links` / `reservation_links`
- [ ] `platform` nur Werte aus `lookups`
- [ ] Koordinaten plausibel (Spanien: lat ~36–44, lng ~-10–4)
- [ ] `slug` eindeutig und ohne Leerzeichen/Umlaute
- [ ] TheFork/Glovo/Uber: exakte URL eingetragen **oder** bewusst leer + `notes`
- [ ] Listenfelder kommagetrennt, ohne trailing comma

---

## Pipeline (nach Excel-Arbeit)

```bash
cd C:\Dev\celiacsafe
pip install -r scripts/requirements.txt

# JSON für App
npm run data:build

# Optional: leere url-Zellen in Excel zurückschreiben
npm run data:enrich-excel
npm run data:enrich-excel:inplace

# Koordinaten nachziehen (v3 → v4)
npm run geocode
```

**Automatik beim Export:** Leere `url` für `thefork`, `glovo`, `uber_eats`, … werden aus `name`, `city`, `slug` gebaut (`scripts/platform_urls.py`). Exakte URLs in Excel haben **immer Vorrang**.

---

## Typische Aufgaben für Claude

1. **Neues Restaurant:** Zeile in `restaurants` + passende Zeilen in `delivery_links` / `reservation_links`.  
2. **TheFork/Glovo ergänzen:** Zeile mit `platform` + URL oder leerer URL + Notiz.  
3. **Bulk-Import:** CSV-ähnlich einfügen, dann IDs und `restaurant_id` prüfen.  
4. **Recherche-Notiz in `notes`**, nie erfundene Telefonnummern oder URLs.

---

## Was du NICHT tun sollst

- Keine anderen Blattnamen oder Spaltenköpfe erfinden  
- Keine zusätzlichen Plattform-Codes ohne Abstimmung  
- Keine Markdown- oder JSON-Datei statt Excel als Master  
- Keine Koordinaten auf 0,0 setzen  
- `restaurant_id` nicht aus `name` ableiten — immer die echte `id`-Spalte  

---

## Beispiel (Minimal)

**restaurants**

| id | name | slug | country_code | region_code | region_name | city | verification_status | latitude | longitude | venue_type |
| -- | ---- | ---- | ------------ | ----------- | ----------- | ---- | ------------------- | -------- | --------- | ---------- |
| es_md_001 | As de Bastos | as-de-bastos-madrid | ES | ES-MD | Comunidad de Madrid | Madrid | to_be_verified | 40.453183 | -3.707916 | restaurant |

**delivery_links**

| id | restaurant_id | restaurant_name | platform | url | is_active | notes |
| -- | ------------- | --------------- | -------- | --- | --------- | ----- |
| dlv_001 | es_md_001 | As de Bastos | glovo | | TRUE | URL in Glovo-App prüfen |

**reservation_links**

| id | restaurant_id | restaurant_name | platform | url | is_active | notes |
| -- | ------------- | --------------- | -------- | --- | --------- | ----- |
| rsv_001 | es_md_001 | As de Bastos | thefork | | TRUE | thefork.es mit Name suchen |
| rsv_002 | es_md_001 | As de Bastos | phone_only | | TRUE | +34917957855 |

Nach `npm run data:build` enthält die JSON z. B. TheFork-URL aus `slug` und Glovo-Such-URL aus Name+Stadt.
