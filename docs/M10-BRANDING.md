# M10 — Branding & Assets

**Ausführliche Icon-Anleitung (Teil 1):** [M10-ICON-DESIGN.md](./M10-ICON-DESIGN.md)

## App-Icon (iOS + Store)

| Spezifikation     | Wert                                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| Datei             | `assets/icon.png`                                                                 |
| Größe             | **1024×1024 px**, PNG, Hintergrund bis zum Rand (kein transparenter Rand für iOS) |
| Empfohlenes Motiv | **Schild + „GF“** auf `#2E7D32`, Text weiß, fett                                  |
| Markenfarben      | `#2E7D32` (primaryDark), Akzent `#A5D6A7`, UI-Hintergrund App `#121212`           |

**Canva/Figma:** Sie entwerfen selbst — siehe Schrittfolge in `M10-ICON-DESIGN.md`.

Nach Ersetzen: `.\scripts\validate-icon-assets.ps1` — dann EAS/Development Build (Expo Go zeigt das finale Icon oft nicht).

## Splash-Screen

**Anleitung:** [M10-SPLASH-DESIGN.md](./M10-SPLASH-DESIGN.md)

| Spezifikation | Wert                                                 |
| ------------- | ---------------------------------------------------- |
| Datei         | `assets/splash.png` (z. B. 1284×2778 aus Canva)      |
| Hintergrund   | `#121212`, `resizeMode: "contain"`                   |
| Inhalt        | Logo zentriert + „Celiac Safe“ + optional Untertitel |

Kein weißer Flash: `userInterfaceStyle: "dark"` + `App.tsx` Boot-Hintergrund `#121212`.

## Android Adaptive Icon

| Datei                                | Rolle                                    |
| ------------------------------------ | ---------------------------------------- |
| `assets/adaptive-icon-fg.png`        | 1024×1024, Vordergrund (Safe Zone ~66 %) |
| `assets/adaptive-icon-bg.png`        | 1024×1024, Hintergrund `#2E7D32`         |
| `assets/android-icon-monochrome.png` | Android 13+ Themed Icon                  |

`app.json` → `android.adaptiveIcon.backgroundColor`: **`#121212`** (Dark App) oder **`#2E7D32`** wenn der Icon-Hintergrund grün sein soll — muss zum `android-icon-background.png` passen.

## Typografie & Spacing im Code

- `src/theme/typography.ts` — Schrift-Skala
- `src/theme/spacing.ts` — 4-Punkt-Grid (4 / 8 / 16 / 24 / 32)
- `src/theme/index.ts` — zentraler Export

Neue Screens: `typography.body`, `SPACE_LG` statt Magic Numbers.

## Checkliste vor Store (M12)

- [ ] `icon.png` final in 1024×1024
- [ ] `splash.png` aus Canva in `assets/`
- [ ] Splash auf echtem Gerät ohne weißen Blitz (`npx expo start --clear`)
- [ ] Adaptive Icon auf Android Pixel/Samsung geprüft
- [ ] Screenshots mit Dark Theme
