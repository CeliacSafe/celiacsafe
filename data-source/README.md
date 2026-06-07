# CeliacSafe Datenquelle

## Dateien

| Datei | Beschreibung |
| ----- | ------------ |
| `CeliacSafe_Datenbank_v4_Spain_129_geocoded.xlsx` | Spanien (129 Restaurants, geocoded) |
| `CeliacSafe_Datenbank_v4_Germany_100GF_Geocoded_Seed.xlsx` | Deutschland Seed (26 Restaurants, geocoded) |
| `CeliacSafe_Datenbank_v4.xlsx` | Ältere Master-Datei (107 Restaurants) |
| `CeliacSafe_Datenbank_v3.xlsx` | Ältere Version (Geocoding-Eingang) |
| `CeliacSafe_Datenbank_v4_enriched.xlsx` | Backup vor Schema-Upgrade |

## Excel-Blätter

- **restaurants** — Stammdaten inkl. `slug`, Koordinaten, `menu_url`, `google_maps_url`, `apple_maps_url`, Kontakt
- **delivery_links** — `restaurant_id`, `platform`, `url`, `is_active`
- **reservation_links** — wie Lieferung, z. B. `thefork`, `phone_only`

### Optionale Spalten im Blatt `restaurants`

| Spalte | Plattform |
| ------ | --------- |
| `thefork_url` | TheFork (Reservierung) |
| `glovo_url` | Glovo |
| `uber_eats_url` | Uber Eats |
| `just_eat_url` | Just Eat |

Diese URLs haben Vorrang vor den Link-Blättern, wenn dort die `url` leer ist.

## Befehle

```bash
npm run data:upgrade-excel      # v3/v4_enriched → v4.xlsx mit neuen Spalten
npm run data:build              # JSON für die App erzeugen
npm run data:enrich-excel       # Excel-Kopie mit ausgefüllten url-Spalten
npm run data:enrich-excel:inplace  # URLs in v4.xlsx zurückschreiben
```

Leere `url` in `delivery_links` / `reservation_links` werden beim Export automatisch ergänzt (siehe `scripts/platform_urls.py`).
