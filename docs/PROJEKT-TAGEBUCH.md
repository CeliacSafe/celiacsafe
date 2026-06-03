# CeliacSafe — Projekt-Tagebuch

Chronologische Dokumentation der Entwicklung. Jeder Eintrag beschreibt, was gemacht wurde, welche Entscheidungen getroffen wurden und was als Nächstes ansteht.

---

## Eintrag #001 — M01 Setup abgeschlossen

**Datum:** 30. Mai 2026  
**Modul:** M01 — Setup  
**Status:** ✅ Abgeschlossen

### Was wurde gemacht?

- Expo-Projekt mit TypeScript-Template erstellt (`celiacsafe`)
- Projektstruktur unter `src/` angelegt (screens, components, navigation, theme, types, data, hooks, utils, store, i18n)
- Theme definiert in `src/theme/colors.ts` (dunkles Design, hellgrüne Akzentfarbe `#A5D6A7`)
- Fünf Screen-Platzhalter erstellt: Buscar, Comunidad, Mapa, Favoritos, Perfil
- Bottom-Tab-Navigation mit React Navigation 7 konfiguriert (`src/navigation/RootTabs.tsx`)
- `App.tsx` umgebaut: SafeAreaProvider, NavigationContainer, RootTabs
- ESLint und Prettier eingerichtet (`npm run lint`, `npm run format`)
- `.gitignore` für Expo, Node.js, IDEs und Betriebssysteme erstellt
- Git-Repository initialisiert und mit GitHub verbunden (`CeliacSafe/celiacsafe`)
- `README.md` und `docs/ARCHITECTURE.md` geschrieben

### Entscheidungen

| Thema            | Entscheidung                            | Begründung                                                                  |
| ---------------- | --------------------------------------- | --------------------------------------------------------------------------- |
| Architektur      | Client-only, JSON-basiert, kein Backend | Einfacher Einstieg, offline-fähig, kein Server-Betrieb nötig                |
| Navigation       | Bottom Tabs (5 Tabs)                    | Standard für Restaurant-/Guide-Apps, alle Bereiche mit einem Tap erreichbar |
| UI-Sprache       | Spanisch (Tab-Labels)                   | Zielmarkt ist Spanien                                                       |
| Code-Sprache     | Englisch (Variablen, Typen)             | Branchenstandard, bessere Tool-Unterstützung                                |
| State Management | Noch offen (M02+)                       | Erst Datenmodell klären, dann Store-Entscheidung treffen                    |

### Commits

1. `d27d571` — Initial commit: Expo app setup with navigation, theme, ESLint and Prettier
2. `b80687a` — M01: ESLint, Prettier, README, Architecture Doc

### Offene Punkte aus M01

- [ ] App einmal auf Android-Handy via Expo Go testen (QR-Code, Tab-Wechsel, Hot Reload)
- [ ] GitHub-Repository auf „Private“ stellen (falls gewünscht)

### Nächster Schritt

**Modul M02 — Datenmodell & JSON-Pipeline**

- TypeScript-Interface `Restaurant` in `src/types/` definieren
- Beispiel-JSON in `src/data/restaurants.json` anlegen
- Lade-Funktion `loadRestaurants()` implementieren
- Hook `useRestaurants()` als Brücke zwischen Daten und UI

---

<!-- Nächster Eintrag: Eintrag #002 — M02 Datenmodell & JSON-Pipeline -->

## Eintrag #002 — M03 Listenansicht abgeschlossen

**Datum:** 2. Juni 2026  
**Modul:** M03 — Restaurant-Liste, Card-Komponenten, Detail-Vorschau  
**Status:** ✅ Abgeschlossen

### Was wurde gemacht?

- `BuscarStack` aufgebaut: `BuscarList` -> `RestaurantDetail`
- `RestaurantCard` auf Basis des Prototyps umgesetzt (Bild, Badges, Favoriten-Button, Accessibility)
- Wiederverwendbare Komponenten eingefuehrt: `BadgePill`, `SkeletonCard`, `EmptyState`
- `BuscarScreen` komplett auf produktive `FlatList` mit Sticky-Header umgestellt
- FlatList-Performance-Optionen gesetzt (`windowSize`, `maxToRenderPerBatch`, `updateCellsBatchingPeriod`, `getItemLayout`)
- Ladezustand ueber `useRestaurants` mit `loading/error/refetch` eingefuehrt
- Skeleton-Pattern integriert (kurze Ladephase mit 5 Platzhalterkarten)
- Counter-Text fuer Pluralisierung vorbereitet (`formatResultCount` in `src/utils/pluralize.ts`)
- `DetailScreen` zu einer nutzbaren Vorschau ausgebaut (Badges, Adresse, Cuisine, Kontakt, Beschreibung)
- `expo-image` und `react-native-reanimated` integriert

### Lernfortschritt dieser Woche

- FlatList und ihre Performance-Optionen
- Stack-Navigator und Tab-Navigator als geschachtelte Hierarchie
- Wiederverwendbare Komponenten (`BadgePill`, `SkeletonCard`, `EmptyState`)
- `Pressable`, Accessibility und Schattenverhalten auf iOS/Android
- `expo-image` im Vergleich zur Standard-`Image`-Komponente
- Loading-States und Skeleton-Pattern fuer bessere wahrgenommene Geschwindigkeit
- Pluralisierung als Vorbereitung fuer i18n

### Nächster Schritt

**Modul M04 — Echte Suche und Filter**

- SearchBar vom Placeholder zur funktionalen Suche ausbauen
- Filterchips (Kueche, Region, Preis, Verifizierung) einfuehren
- Ergebniszaehler und Empty-State mit aktiven Filtern verknuepfen

---

## 2026-06-02 — M04 abgeschlossen

**Heute geschafft:**

- Zustand als State-Library kennengelernt
- `filterStore` mit allen Filter-States
- `searchAndFilter`-Util mit Akzent-Normalisierung
- Jest-Tests grün (`matchesQuery`, `matchesFilter`, `sortRestaurants`)
- `SearchBar`-Komponente mit Clear-Button
- `FilterPills` horizontal scrollbar
- `@gorhom/bottom-sheet` eingerichtet
- `FilterBottomSheet` mit Region, Preis, Verifizierung, Sort
- `EmptyState` mit „Filter zurücksetzen“-Action
- Theme-Polish: `spacing.ts`, `radii.ts`, Farben nur aus `colors.ts`

**Probleme & Lösungen:**

- Expo-Tunnel zeitweise instabil → LAN-Start (`npm run start:lan`) als Fallback
- OneDrive-Pfad blockierte Metro → Entwicklung unter `C:\Dev\celiacsafe`

**Gelernt:**

- Globaler vs. lokaler State
- `useMemo` für berechnete Werte
- Unicode-Normalisierung (NFD)
- Bottom-Sheet-Patterns mit `forwardRef`
- Test-Driven Development für Logik-Funktionen

**Aufwand insgesamt:** ~6 Std über 2 Tage  
**Stimmung:** Filter machen die App fertig anzufühlen

### Nächster Schritt

**Modul M05 — Karte (Mapa)**

- Restaurants auf Karte darstellen
- Marker und Clustering vorbereiten

---

## 2026-06-02 — M05 abgeschlossen

**Heute geschafft:**

- Geocoding-Skript mit Nominatim und Stadt-Fallback
- 107 Restaurants haben jetzt Koordinaten
- `react-native-maps` integriert
- `CustomMarker` im Brand-Design
- `RestaurantBottomSheet` mit Aktionen (Anrufen, Webseite, Route, Detail)
- `MapaStack` für Detail-Navigation aus der Karte
- `useUserLocation`-Hook + `MyLocationButton`
- Region-Quick-Jumps oben (España, Madrid, Barcelona, Mallorca, …)
- Filter aus M04 wirken auch auf der Karte
- Marker-Performance: `React.memo`, `tracksViewChanges={false}`, `RestaurantMapMarker`

**Gelernt:**

- Plattform-spezifische APIs (Apple Maps vs. Google Maps)
- Native Marker-Performance (`tracksViewChanges`)
- Geocoding über öffentliche APIs
- Standort-Berechtigungen (When-In-Use)
- `animateToRegion` für sanfte Karten-Übergänge

**Aufwand insgesamt:** ~12 Std über 7 Tage  
**Stimmung:** Karten machen einfach Spaß

### Nächster Schritt

**Modul M06 — Volle Detail-Ansicht**

- DetailScreen ausbauen (Bilder, Öffnungszeiten, vollständige Infos)

---

## 2026-06-02 — M06 abgeschlossen

**Heute geschafft:**

- `openExternalUrl`-Util für plattform-übergreifendes Linking
- `DetailHeader` mit Hero, Badges, Heart-Button
- `QuickActionsBar` mit Anrufen/WhatsApp/Web/Route
- `VerificationSection` — transparente Erklärung
- `AddressSection` mit Mini-Map und Routing
- `DescriptionBlock`, `CuisineTagsRow`, `OpeningHours`
- `SeasonalClosureBanner` für Saison-Hinweise
- `DeliveryButtons` (Glovo, Just Eat, Uber Eats, etc.)
- `ReservationSection` (TheFork, OpenTable, eigene Web, Telefon)
- `ContactDetailsSection` (sekundäre Kontakt-Methoden)
- `Disclaimer` mit klarer rechtlicher Information
- Conditional Rendering — Sektionen nur bei vorhandenen Daten
- Theme-Polish: einheitliche Sektion-Titel, `RADIUS_SUB` (8) / `RADIUS_INPUT` (12)
- Haptisches Feedback mit `expo-haptics` (Heart-Toggle)

**Gelernt:**

- Conditional Rendering — wann zeige ich was?
- Plattform-spezifische URL-Schemata (`tel:`, `mailto:`, `maps:`, `geo:`)
- Haptisches Feedback mit expo-haptics
- Wiederverwendung von Komponenten aus früheren Modulen (`BadgePill`, `MapView`)
- Layout-Hierarchie für inhaltsreiche Seiten

**Aufwand insgesamt:** ~10 Std über 7 Tage  
**Stimmung:** Die App wirkt jetzt komplett, auch ohne die letzten 6 Module

### Nächster Schritt

**Modul M07 — Favoriten & Persistenz**

- `useFavoritesStore` mit AsyncStorage
- Heart-Button funktional in Liste und Detail

---

## 2026-06-02 — M07 abgeschlossen

**Heute geschafft:**

- AsyncStorage installiert und konfiguriert
- `favoritesStore` mit Zustand + persist-Middleware
- `HeartButton` mit Reanimated Scale-Animation
- Heart-Synchronisation zwischen Card und Detail
- `FavoritosScreen` mit Sortierung und Empty-State
- `FavoritosStack` für Detail-Navigation
- Tab-Badge mit Live-Favoriten-Anzahl
- Swipe-to-Remove in FavoritosScreen
- Jest-Tests für Favoriten-Store
- Splash/Hydration bis AsyncStorage geladen ist

**Gelernt:**

- Persistenz mit `zustand/middleware/persist`
- Hydration-Status und Splash-Screen-Verzögerung
- React Hooks: `useSharedValue`, `useAnimatedStyle`
- Tab-Badge in React Navigation
- Architekturprinzip: „state colocated with usage“

**Aufwand insgesamt:** ~7 Std über 6 Tage  
**Stimmung:** Gut — endlich mal kein Marathon-Modul

### Nächster Schritt

**Modul M08 — Mehrsprachigkeit**

- Sprache in AsyncStorage persistieren
- UI-Texte für es/en/de

---

## 2026-06-03 — M08 abgeschlossen

**Heute geschafft:**

- i18next + react-i18next + expo-localization installiert
- 3 Locale-Dateien (es, en, de) mit ~150 Keys jeweils
- `i18n/index.ts` mit Geräte-Sprach-Erkennung
- `languageStore` mit Persistenz (Zustand + AsyncStorage)
- `LanguageSwitcher`-Komponente in zwei Varianten
- Migration aller UI-Strings durch `useTranslation`
- `useLocalized`-Hook für Region-/Venue-/Cuisine-Namen + Beschreibungen
- `formatDate` für locale-spezifische Datumsformate
- Profil-Tab mit Sprachauswahl, Version, Disclaimer

**Probleme & Lösungen:**

- `compatibilityJSON: 'v4'` in i18next nötig für React Native / Hermes
- ESLint `i18next/no-literal-string` als Spickzettel — Markenname „Celiac Safe“ bewusst nicht übersetzt
- Tunnel-Modus (`npm start`) instabil → `npm run start:lan` für Gerätetests

**Gelernt:**

- i18next `compatibilityJSON` v4 für react-native
- Plural-Forms in i18next (`_one`, `_other`)
- Geräte-Sprach-Erkennung mit expo-localization
- `toLocaleDateString` für regionale Datumsformate
- Architekturprinzip: `useLocalized`-Hook statt `language`-Props

**Aufwand insgesamt:** ~12 Std über 7 Tage  
**Stimmung:** Erstaunlich befriedigend — die App fühlt sich plötzlich global an

### Nächster Schritt

## 2026-06-02 — M09 abgeschlossen

**Heute geschafft:**

- `expo-mail-composer`, `expo-application`, `expo-store-review` installiert
- `submitViaEmail`-Utility mit strukturiertem E-Mail-Format
- `SubmitRestaurantScreen` mit Formular und Validierung
- `AboutScreen` mit Mission, Konzept, „Wer dahinter steht“
- `PrivacyScreen` mit strukturierter Datenschutzerklärung (Locale-Arrays)
- `ImpressumScreen` mit Pflichtangaben
- `RateAppButton` und `ShareAppButton`
- `PerfilScreen` final mit 5 Sektionen
- `PerfilStack` für Sub-Navigation
- i18n: 151 Keys × 3 Sprachen (es/en/de), Kontakt-Adressen vereinheitlicht

**Gelernt:**

- E-Mail-basierte Submission ohne Backend
- `expo-application` für Versions-Info
- `expo-store-review` für In-App-Bewertung (systemseitige Quoten beachten)
- Strukturierte Datenschutzerklärung als Locale-Array

**Architektur:** E-Mail statt Backend — Vorschläge landen im Posteingang, keine Server-DSGVO-Komplexität.

**Aufwand insgesamt:** ~10 Std über 7 Tage (Modul M09)  
**Stimmung:** Zwei Drittel des Kurses — ein Modul mehr, vor Polish

---
