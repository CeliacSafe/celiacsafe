# CeliacSafe

**CeliacSafe — Mobile App für 100% glutenfreie Restaurants in Spanien**

CeliacSafe hilft Menschen mit Zöliakie und Glutenunverträglichkeit, sicher und zuverlässig Restaurants in Spanien zu finden, die ausschließlich glutenfrei kochen. Keine Unsicherheit, keine Kompromisse — nur verifizierte, 100% glutenfreie Lokale.

---

## Status

**M09 abgeschlossen — Profil-Tab & Restaurant-Submission**

Vollständiger Profil-Tab mit Navigation zu Über die App, Datenschutz, Impressum und Restaurant-Vorschlag. Submissions und Fehlerberichte laufen per vorausgefüllter E-Mail (kein Backend). App-Version aus `expo-application`, Store-Bewertung via `expo-store-review`.

---

## Tech-Stack

| Technologie                   | Verwendung                                         |
| ----------------------------- | -------------------------------------------------- |
| **Expo SDK 52+**              | Cross-Platform-Framework für iOS und Android       |
| **React Native + TypeScript** | UI und typsichere Entwicklung                      |
| **React Navigation 7**        | Bottom-Tab-Navigation zwischen den Hauptbereichen  |
| **react-native-maps**         | Karte (Apple Maps / Google Maps je nach Plattform) |
| **expo-location**             | Standort nur on-demand (My-Location-Button)        |
| **expo-haptics**              | Haptisches Feedback (Heart-Toggle, Sprachwechsel)  |
| **i18next + react-i18next**   | UI-Internationalisierung (es/en/de)                |
| **expo-localization**         | Geräte-Spracherkennung beim ersten Start             |
| **expo-mail-composer**        | Restaurant-Vorschläge & Kontakt per E-Mail         |
| **expo-application**          | App-Version im Profil                              |
| **expo-store-review**         | Native Store-Bewertung                             |

Weitere Tools: ESLint, Prettier, Jest (`jest-expo`), Zustand, `@react-native-async-storage/async-storage`, `@gorhom/bottom-sheet`, `@expo/vector-icons`, `expo-linear-gradient`, `expo-image`, `react-native-reanimated`

---

## Setup

### Voraussetzungen

- [Node.js](https://nodejs.org/) (LTS empfohlen)
- [Expo Go](https://expo.dev/go) auf dem Android-Gerät (oder iOS)
- Python 3 + `pip install -r scripts/requirements.txt` (für Daten-Pipeline)

### Installation und Start

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten (Tunnel — Standard für Handy-Tests)
npm start
```

### App auf dem Gerät testen

1. `npm start` ausführen — startet Expo im **Tunnel-Modus** (funktioniert auch ohne gleiches WLAN).
2. **Expo Go** auf dem Android-Gerät öffnen.
3. QR-Code scannen — beim ersten Start 30–60 Sekunden warten.

Alternativ:

```bash
npm run start:tunnel   # explizit Tunnel (gleich wie npm start)
npm run start:lan      # nur LAN, wenn Tunnel Probleme macht
```

### Daten-Pipeline

```bash
npm run geocode      # v3.xlsx → v4.xlsx mit Koordinaten (Nominatim + Stadt-Fallback)
npm run data:build   # v4.xlsx → src/data/restaurants.json
python scripts/verify-geo.py   # Koordinaten in JSON prüfen
```

### Code-Qualität

```bash
npm run lint      # ESLint — Fehler und Warnungen prüfen
npm run format    # Prettier — Code automatisch formatieren
npm test          # Jest — Filter-Logik + Favoriten-Store
```

---

## Geo-Daten

- Jedes Restaurant in `src/data/restaurants.json` enthält **`latitude`** und **`longitude`** (107 Einträge nach Geocoding).
- **`scripts/geocode.py`**: Online-Geocoding via [Nominatim](https://nominatim.openstreetmap.org/) (1,2 s Pause pro Request), Fallback auf Stadt-Mittelpunkt; optional `--fallback-only`.
- **`npm run geocode`**: Erzeugt `data-source/CeliacSafe_Datenbank_v4.xlsx` aus v3.
- **`npm run data:build`**: Exportiert die angereicherte Excel nach JSON für die App.

---

## Berechtigungen

| Berechtigung               | Wann                                    | Zweck                                                      |
| -------------------------- | --------------------------------------- | ---------------------------------------------------------- |
| **Standort (When In Use)** | Nur beim Tap auf den My-Location-Button | Karte auf Nutzerposition zentrieren, blauer Standort-Punkt |

Es wird **kein** Hintergrund-Standort abgefragt. Der Berechtigungstext steht in `app.json` (`NSLocationWhenInUseUsageDescription`).

---

## Projektstruktur

```
celiacsafe/
├── App.tsx                 # Einstiegspunkt (SafeArea, Navigation)
├── scripts/                # geocode.py, excel-to-json.py, verify-geo.py
├── data-source/            # Excel-Quellen (v3, v4)
├── src/
│   ├── screens/            # Bildschirme der App (Buscar, Mapa, Favoritos, …)
│   ├── components/         # Wiederverwendbare UI-Bausteine
│   ├── navigation/         # React-Navigation-Konfiguration (Bottom Tabs)
│   ├── theme/              # Farben, Schriften, Abstände
│   ├── types/              # TypeScript-Typen und Interfaces
│   ├── data/               # Statische Daten (JSON, quickJumps, filterOptions)
│   ├── hooks/              # Eigene React-Hooks
│   ├── utils/              # Hilfsfunktionen
│   ├── store/              # App-State-Management
│   └── i18n/               # Übersetzungen (Spanisch, Deutsch, …)
├── assets/                 # Icons, Splash-Screen, Bilder
└── package.json
```

---

## Datenspeicherung

| Daten        | Speicherort            | Persistenz        | Modul |
| ------------ | ---------------------- | ----------------- | ----- |
| Restaurants  | read-only JSON-Asset   | App-Bundle (M02)  | M02   |
| Favoriten    | AsyncStorage           | Gerät, persistent | M07   |
| Filter/Suche | Zustand in-memory      | Nur App-Laufzeit  | M04   |
| Sprache      | AsyncStorage           | Gerät, persistent | M08   |

---

## Komponenten

Wiederverwendbare UI-Bausteine in `src/components/`:

- `RestaurantCard` - Hauptkarte der Suchliste mit Bild, Badges und Favoriten-Icon
- `BadgePill` - Einheitliche Tag-/Badge-Darstellung fuer Status, Cuisine und Preis
- `SearchBar`, `FilterPills`, `FilterBottomSheet` - Suche und Filter (M04)
- `CustomMarker`, `RestaurantMapMarker` - Marken-Pins auf der Karte
- `RestaurantBottomSheet` - Vorschau und Aktionen beim Marker-Tap
- `MyLocationButton`, `RegionQuickJumps` - Standort und Karten-Shortcuts
- `DetailHeader`, `QuickActionsBar`, `VerificationSection`, `AddressSection` - Detail-Seite (M06)
- `DescriptionBlock`, `CuisineTagsRow`, `OpeningHours`, `SeasonalClosureBanner` - Inhalts-Sektionen
- `DeliveryButtons`, `ReservationSection`, `ContactDetailsSection`, `Disclaimer` - Aktionen & Rechtliches
- `HeartButton`, `SwipeableRestaurantCard` - Favoriten-Interaktion (M07)
- `LanguageSwitcher` - Sprachauswahl compact/full (M08)
- `ProfileMenuRow`, `ProfileMenuCard` - Profil-Menüzeilen (M09)

---

## Features (M09 — Profil & Submission)

- **`PerfilStack`** — About, Privacy, Impressum, SubmitRestaurant
- **Restaurant vorschlagen** — Formular → `submitViaEmail` → `submissions@celiacsafe.app`
- **Fehler melden / Kontakt** — vorausgefüllte E-Mails an `info@celiacsafe.app`
- **App bewerten** — `expo-store-review`
- **App teilen** — System-Share-Dialog
- **Rechtliches in-app** — Datenschutz & Impressum (i18n-Texte)

E-Mail-Adressen konfigurierbar in `src/constants/appContact.ts`.

---

## Features (M08 — Internationalisierung)

- **3 Sprachen:** Spanisch (Standard), Englisch, Deutsch
- **Geräte-Sprache** wird beim ersten Start via `expo-localization` erkannt
- **Manuelle Sprachauswahl** im Profil-Tab, persistent in AsyncStorage (`languageStore`)
- **~150 UI-Keys** pro Locale in `src/i18n/locales/{es,en,de}.json`
- **`useLocalized`** — Region-, Venue- und Cuisine-Namen + mehrsprachige Beschreibungen
- **`formatDate` / `useFormatDate`** — locale-spezifische Datumsformate (z. B. Verifizierungsdatum)
- **Pluralformen** via i18next (`_one` / `_other`) für Ergebniszähler und Filter

---

## Internationalisierung

| Thema | Details |
| ----- | ------- |
| **Tech-Stack** | i18next, react-i18next, expo-localization |
| **Locale-Dateien** | `src/i18n/locales/es.json`, `en.json`, `de.json` |
| **Initialisierung** | `src/i18n/index.ts` (Fallback `es`, `compatibilityJSON: 'v4'`) |
| **Sprach-Store** | `src/store/languageStore.ts` — Override vs. Gerätesprache |
| **Lookup-Daten** | `src/data/lookups.ts` → Region/Venue/Cuisine (M02) |
| **Key-Struktur** | `tabs`, `search`, `filter`, `detail`, `favorites`, `profile`, `errors`, `disclaimer`, `map`, `card`, `community` |

---

## Beitragen

### Neue Sprache hinzufügen

1. Neue Datei `src/i18n/locales/XX.json` anlegen (Keys aus `es.json` kopieren)
2. In `src/i18n/index.ts` importieren und in `resources` registrieren
3. `SupportedLanguage`-Typ und `LanguageSwitcher` um die neue Sprache erweitern

### Übersetzungs-Bugs melden

Fehlerhafte oder fehlende Übersetzungen bitte per E-Mail melden (Kontakt folgt in M09).

---

## Features (M04 — Filter & Suche)

- **Suche** in Name, Stadt, Region und Cuisine (mehrere Begriffe = UND)
- **Akzent-insensitive Suche** — z. B. „Cataluna“ findet „Cataluña“ (Unicode-NFD)
- **7 Venue-Type-Filter-Pills**, Bottom-Sheet mit Region/Preis/Verifizierung/Sortierung
- **Live-Counter**, **Filter zurücksetzen** im Leerzustand
- Globaler State: **`useFilterStore`** + **`applyFilters`**

---

## Features (M07 — Favoriten)

- **`favoritesStore`** — Zustand + `persist`, speichert nur Restaurant-IDs + Zeitstempel
- **`HeartButton`** — Store-Anbindung, Haptik, Reanimated Bounce/Wiggle
- **Synchronisation** — Heart in `RestaurantCard` und `DetailHeader` immer konsistent
- **`FavoritosScreen`** — sortiert nach Hinzufüge-Datum (neueste zuerst), Empty-State
- **`FavoritosStack`** — Detail-Navigation aus dem Favoritos-Tab
- **Tab-Badge** — Live-Anzahl am Favoritos-Tab (`colors.heart`)
- **Swipe-to-Remove** — nach links wischen entfernt Favorit
- **Hydration** — Splash bleibt bis AsyncStorage geladen ist

---

## Features (M06 — Detail-Seite)

- **Hero** mit Bild, Badges (100% sin gluten, Verifizierung, Preis), Heart-Button mit Haptik
- **Quick-Actions** — Anrufen, WhatsApp, Web, Route (nur wenn Daten vorhanden)
- **Verifizierungs-Transparenz** — Methoden, FACE/AOECS, Datum, Warnung bei alter Verifizierung
- **Adress-Sektion** mit Mini-Map (180pt) und Routing-Button
- **Beschreibung** mit „Leer más“, **Cuisine-Tags**, **Öffnungszeiten** (nur bei Daten)
- **Lieferdienst-Integration** — Glovo, Just Eat, Uber Eats, Wolt, Deliveroo, eigenes Delivery
- **Reservierungs-Buttons** — TheFork, OpenTable, Telefon, Walk-in, Instagram DM
- **Kontakt-Details** — sekundäre Liste (Telefon, Social, E-Mail)
- **Rechtlicher Disclaimer** — dezent hervorgehoben am Seitenende
- **`openExternalUrl`** — plattformübergreifendes Linking (`tel:`, `mailto:`, Maps, Social)

---

## Features (M05 — Karte)

- **107 Pins** auf Spanien-Karte (`react-native-maps`, `PROVIDER_DEFAULT`)
- **RestaurantBottomSheet** — Anrufen, Website, Route, Navigation zu Detail
- **MapaStack** — Detail aus dem Mapa-Tab mit Zurück zur Karte
- **M04-Filter** wirken auf sichtbare Pins (gleicher Zustand-Store)
- **My Location** — `expo-location`, Berechtigung nur on-demand
- **Region-Quick-Jumps** — España, Madrid, Barcelona, Mallorca, Valencia, Andalucía, Euskadi

---

## State Management

- **Zustand** für globalen Filter-State (`src/store/filterStore.ts`) — nicht persistent
- **`useFilterStore`** in Buscar- und Mapa-Flow geteilt
- **`useFavoritesStore`** mit AsyncStorage-Persistenz (`src/store/favoritesStore.ts`)
- **`useLanguageStore`** mit AsyncStorage-Persistenz (`src/store/languageStore.ts`)
- **`useLocalized`** für Lookup-Tabellen und Beschreibungen (`src/hooks/useLocalized.ts`)
- **`applyFilters`** kombiniert Suche, Filter und Sortierung; getestet mit Jest

---

## Navigation-Struktur

```mermaid
graph TD
  RootTabs
  RootTabs --> BuscarStack
  BuscarStack --> BuscarList
  BuscarStack --> RestaurantDetail
  RootTabs --> MapaStack
  MapaStack --> MapaMain
  MapaStack --> RestaurantDetail
  RootTabs --> ComunidadScreen
  RootTabs --> FavoritosStack
  FavoritosStack --> FavoritosList
  FavoritosStack --> RestaurantDetail
  RootTabs --> PerfilScreen
```

---

## Roadmap

| Modul   | Status | Inhalt                                           |
| ------- | ------ | ------------------------------------------------ |
| **M01** | ✅     | Setup — Expo, Navigation, Theme, ESLint/Prettier |
| **M02** | ✅     | Datenmodell & JSON-Pipeline                      |
| **M03** | ✅     | Restaurant-Liste mit Card-Komponente             |
| **M04** | ✅     | Filter & Suche                                   |
| **M05** | ✅     | Karte (Mapa)                                     |
| **M06** | ✅     | Volle Detail-Ansicht                             |
| **M07** | ✅     | Favoriten & Persistenz                           |
| **M08** | ✅     | Mehrsprachigkeit (es/en/de)                      |
| **M09** | ✅     | Profil-Tab, E-Mail-Submission, Store-Review      |

---

## Lizenz

**Nicht-kommerziell — alle Rechte vorbehalten.**

Dieses Projekt ist urheberrechtlich geschützt. Eine Nutzung, Vervielfältigung oder Weitergabe ohne ausdrückliche schriftliche Genehmigung des Autors ist nicht gestattet.
