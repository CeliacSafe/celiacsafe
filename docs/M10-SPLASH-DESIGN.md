# M10 Teil 2 — Splash-Screen

## 2.1 Konzept

| Regel       | CeliacSafe                                                           |
| ----------- | -------------------------------------------------------------------- |
| **Einfach** | Logo + App-Name, optional ein Untertitel — keine Animation im Splash |
| **Theme**   | Hintergrund `#121212` (wie `theme/colors.background`)                |
| **Dauer**   | Nur 0,5–2 s sichtbar; längeres Warten = In-App-`LoadingSpinner`      |

## 2.2 In Canva entwerfen

1. Neue Datei **1284 × 2778 px** (großes iPhone-Format; Expo skaliert für andere Geräte)
2. Hintergrund **`#121212`**
3. **App-Icon** zentriert, ca. **40 % der Breite** (~500 px)
4. Darunter: **„Celiac Safe“** — groß, fett, **`#A5D6A7`**
5. Optional: **„Guía esencial sin gluten“** — kleiner, **`#B3B3B3`** (`textSecondary`)
6. Motiv im **mittleren Drittel** halten (oben/unten können je Gerät beschnitten werden)
7. Export als **`splash.png`** (PNG)

### Alternative (nur Logo, klein)

Falls Sie statt Vollbild-Splash nur ein Logo wollen: quadratisches PNG (z. B. 512×512) als `splash-icon.png` — dann Plugin mit `imageWidth: 200`. **Empfohlen für M10:** Vollbild-`splash.png` wie oben.

## 2.3 Dateien im Projekt

| Canva-Export           | Ziel                          |
| ---------------------- | ----------------------------- |
| `icon.png`             | `assets/icon.png`             |
| `splash.png`           | `assets/splash.png`           |
| `adaptive-icon-fg.png` | `assets/adaptive-icon-fg.png` |
| `adaptive-icon-bg.png` | `assets/adaptive-icon-bg.png` |

Legacy-Namen (weiterhin erkannt vom Validierungsskript): `android-icon-foreground.png`, `android-icon-background.png`, `splash-icon.png`.

## 2.4 `resizeMode`: `contain` vs `cover`

| Modus         | Verhalten                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **`contain`** | Gesamtes Bild ist sichtbar, Seitenverhältnis bleibt — bei anderem Display-Format **Ränder** in `backgroundColor` (`#121212`) |
| **`cover`**   | Bild füllt den Screen, Seitenverhältnis bleibt — Ränder des Bildes können **abgeschnitten** werden                           |

**Empfehlung:** Vollbild-Splash aus Canva mit zentriertem Logo → **`contain`** + dunkler Hintergrund (Kurs-Vorgabe). Wichtig: Inhalt in der **Mitte** platzieren.

## 2.5 Testen

```powershell
cd C:\Dev\celiacsafe
npx expo start --clear
# oder
npm run start:lan
```

- Expo Go **komplett schließen**, neu per QR öffnen
- Splash in **Expo Go** oft **kurz** und nicht identisch mit Production
- **Homescreen-Icon** und finaler Splash: erst mit **EAS Build** (M12)

### Splash fehlt?

1. `npx expo start --clear`
2. `app.json`-Syntax prüfen
3. Liegt `assets/splash.png` wirklich vor?
4. `.\scripts\validate-icon-assets.ps1`
5. Expo Go Cache: App neu installieren
