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
