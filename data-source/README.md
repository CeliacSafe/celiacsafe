# CeliacSafe Datenquelle

## Dateien

| Datei | Beschreibung |
| ----- | ------------ |
| `CeliacSafe_Datenbank_v4.xlsx` | Aktuelle Master-Datei (Export für die App) |
| `CeliacSafe_Datenbank_v3.xlsx` | Ältere Version (Geocoding-Eingang) |

## Excel-Blätter

- **restaurants** — Stammdaten inkl. `slug`, Koordinaten, Kontakt
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
npm run data:build              # JSON für die App erzeugen
npm run data:enrich-excel       # Excel-Kopie mit ausgefüllten url-Spalten
npm run data:enrich-excel:inplace  # URLs in v4.xlsx zurückschreiben
```

Leere `url` in `delivery_links` / `reservation_links` werden beim Export automatisch ergänzt (siehe `scripts/platform_urls.py`).
