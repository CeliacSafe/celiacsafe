# Admin-Tool (in der App)

Internes Curator-Tool unter **Profil → Versionszeile 5× tippen → PIN**.

Standard-PIN: `4829` — in `src/constants/adminConfig.ts` ändern.

## Funktionen

| Bereich | Beschreibung |
| -------- | ------------- |
| **Restaurants** | Liste durchsuchen, bearbeiten, neu anlegen, aus App ausblenden |
| **Vorschläge** | In-App-Vorschläge (Formular) + CSV-Importe; prüfen, übernehmen, ablehnen |
| **CSV importieren** | Restaurants- oder Submissions-CSV (Excel-Format) |
| **Export** | CSV teilen → in Excel einfügen → `npm run data:build` |

## Vorschläge

- Jedes Absenden im Formular „Restaurant vorschlagen“ wird **lokal** in der Vorschläge-Queue gespeichert (zusätzlich E-Mail).
- Vorschläge anderer Nutzer: CSV aus Excel-Blatt `submissions` importieren oder E-Mail manuell pflegen.

## Hinweis

Ohne Backend sind Admin-Daten **nur auf dem Admin-Gerät**. Für alle Nutzer sichtbar werden Änderungen erst nach Excel/JSON-Release.
