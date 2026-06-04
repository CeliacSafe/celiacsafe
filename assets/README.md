# Assets — CeliacSafe

Markenlogo: **`assets/brand/celiacsafe-logo.png`** (horizontales CeliacSafe-Logo). App-Icons erzeugen:

**Restaurant-Arten:** Standardfotos in `assets/venue-types/` (Pizza, Brot, Kaffee, …). Neu laden:

```powershell
npm run assets:venue-photos
```

Quellen-SVGs: `assets/brand/`. PNGs neu erzeugen:

```powershell
npm run assets:generate
```

Optional: Canva-Exporte überschreiben die generierten Dateien (M10 Teil 1 + 2).

## Pflicht (Store / Build)

| Datei                  | Spezifikation                                        |
| ---------------------- | ---------------------------------------------------- |
| `icon.png`             | 1024×1024, PNG, Hintergrund bis zum Rand             |
| `splash.png`           | z. B. 1284×2778, Logo + Text zentriert, BG `#121212` |
| `adaptive-icon-fg.png` | 1024×1024, Motiv in Safe Zone, transparent           |
| `adaptive-icon-bg.png` | 1024×1024, z. B. `#2E7D32` Vollfläche                |

## Optional

| Datei                         | Hinweis                 |
| ----------------------------- | ----------------------- |
| `android-icon-monochrome.png` | Android 13+ themed icon |
| `favicon.png`                 | Web                     |

## Legacy-Aliase (falls Sie alte Namen nutzen)

| Alt                           | Neu                              |
| ----------------------------- | -------------------------------- |
| `splash-icon.png`             | Kopie/umbenennen zu `splash.png` |
| `android-icon-foreground.png` | → `adaptive-icon-fg.png`         |
| `android-icon-background.png` | → `adaptive-icon-bg.png`         |

## Doku

- Icon: [docs/M10-ICON-DESIGN.md](../docs/M10-ICON-DESIGN.md)
- Splash: [docs/M10-SPLASH-DESIGN.md](../docs/M10-SPLASH-DESIGN.md)

## Prüfung

```powershell
cd C:\Dev\celiacsafe
.\scripts\validate-icon-assets.ps1
```
