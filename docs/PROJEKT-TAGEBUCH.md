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

| Thema | Entscheidung | Begründung |
|---|---|---|
| Architektur | Client-only, JSON-basiert, kein Backend | Einfacher Einstieg, offline-fähig, kein Server-Betrieb nötig |
| Navigation | Bottom Tabs (5 Tabs) | Standard für Restaurant-/Guide-Apps, alle Bereiche mit einem Tap erreichbar |
| UI-Sprache | Spanisch (Tab-Labels) | Zielmarkt ist Spanien |
| Code-Sprache | Englisch (Variablen, Typen) | Branchenstandard, bessere Tool-Unterstützung |
| State Management | Noch offen (M02+) | Erst Datenmodell klären, dann Store-Entscheidung treffen |

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
