# M10 Teil 1 — App-Icon entwerfen

> **Design-Entscheidungen treffen Sie selbst** (Canva/Figma). Dieses Dokument ist die technische und inhaltliche Vorarbeit für CeliacSafe.

## 1.1 Drei Leitfragen (ausfüllen, bevor Sie pixeln)

| Frage                          | CeliacSafe — Vorschlag                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| **Was kommuniziert das Icon?** | 100 % glutenfrei — klassisches **Glutenfrei-Zeichen** (Ähre + Durchstreichung) |
| **Welche Form?**               | **Quadrat 1024×1024** — iOS/Android runden automatisch ab                      |
| **Welche Farben?**             | Hintergrund `#2E7D32`, Symbol **Weiß** `#FFFFFF`; Splash-Akzent `#A5D6A7`      |

## 1.2 Gewähltes Symbol (Glutenfrei-Zeichen)

| Element            | Bedeutung                                      |
| ------------------ | ---------------------------------------------- |
| **Weizenähre**     | Gluten als Referenz                            |
| **Kreis + Strich** | Verbot / ohne Gluten — international verständlich |
| **Grün**           | Sicherheit, „frei von“ (App-Farbe primaryDark) |

### Technische Umsetzung im Repo

- SVG-Vorlagen: `assets/brand/gluten-free-icon.svg`, `gluten-free-adaptive-fg.svg`, `gluten-free-splash.svg`
- PNG-Export: `npm run assets:generate` (Skript `scripts/generate-brand-assets.mjs`)

**Vermeiden:** dünne Linien, langer Text („SIN GLUTEN“), viele Details, Schatten am Rand, selbst gezeichnete abgerundete Ecken.

## 1.3 Tools

| Tool          | URL                           | Wann                                |
| ------------- | ----------------------------- | ----------------------------------- |
| **Canva**     | https://www.canva.com         | Schneller Start (empfohlen für M10) |
| Figma         | https://www.figma.com         | Mehr Kontrolle, später              |
| Adobe Express | https://www.adobe.com/express | Templates                           |

## 1.4 Canva — Schrittfolge

1. Canva → **Benutzerdefinierte Größe** → **1024 × 1024 px**
2. Hintergrund: **`#2E7D32`**
3. Element: **Schild** (shield), zentriert, groß
4. Text: **GF**, weiß, sehr groß (Test: bei ~80 px Vorschau noch lesbar?)
5. Optional: Häkchen-Icon
6. **Vorschau:** Design auf ~40×40 verkleinern — noch erkennbar? Sonst vereinfachen.
7. Export: **PNG**, 1024×1024, **ohne** Transparenz (Hintergrund bis zum Rand)
8. Datei: `icon.png`

### iOS-Anforderungen

- Exakt **1024×1024**
- **PNG**, volle Fläche (kein transparenter Rand)
- **Keine** manuellen Rundungen, **keine** Drop-Shadows am Rand

## 1.5 Android Adaptive Icon

Zwei Ebenen (je **1024×1024**):

```
┌──────────────────────── 1024 px ────────────────────────┐
│  ░░░░░░░░░░░░░  Beschnitt-Zone (variiert je Gerät)  ░░░░ │
│  ░░  ┌──────────────── Safe Zone ~660 px ─────────┐  ░░ │
│  ░░  │         Schild + GF (alles Wichtige)        │  ░░ │
│  ░░  └────────────────────────────────────────────┘  ░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└───────────────────────────────────────────────────────────┘
```

| Datei im Projekt                     | Inhalt                                      |
| ------------------------------------ | ------------------------------------------- |
| `assets/android-icon-background.png` | Vollfläche `#2E7D32` (oder Verlauf)         |
| `assets/android-icon-foreground.png` | Nur Schild + **GF**, **transparenter** Rest |
| `assets/android-icon-monochrome.png` | Optional: weiße Silhouette für Android 13+  |

**Safe Zone:** Wichtiges Motiv im **inneren Kreis ~660 px** Durchmesser (ca. 66 % der Kantenlänge).

In `app.json` ist `android.adaptiveIcon.backgroundColor` auf `#121212` (Dark App) — für ein **grünes** Icon können Sie stattdessen `#2E7D32` setzen, wenn der Hintergrund-Layer nur Farbe ist.

## Dateien nach Export ablegen

Kopieren Sie Ihre PNGs nach `C:\Dev\celiacsafe\assets\`:

| Ihre Datei              | Ziel im Repo                         |
| ----------------------- | ------------------------------------ |
| `icon.png` (Canva)      | `assets/icon.png`                    |
| Vordergrund transparent | `assets/android-icon-foreground.png` |
| Hintergrund grün        | `assets/android-icon-background.png` |
| (optional) Monochrom    | `assets/android-icon-monochrome.png` |

Prüfung:

```powershell
cd C:\Dev\celiacsafe
.\scripts\validate-icon-assets.ps1
```

## Nach dem Austausch testen

```powershell
npm run start:lan
```

Für **echtes Homescreen-Icon:** Development Build oder EAS Build — **Expo Go** zeigt oft nicht Ihr finales Icon.

## Nächster Schritt (M10 Teil 2)

Gleiches Motiv vereinfacht für `assets/splash-icon.png` (Logo auf `#121212` oder `#2E7D32`).
