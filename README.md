# CeliacSafe

**CeliacSafe — Mobile App für 100% glutenfreie Restaurants in Spanien**

CeliacSafe hilft Menschen mit Zöliakie und Glutenunverträglichkeit, sicher und zuverlässig Restaurants in Spanien zu finden, die ausschließlich glutenfrei kochen. Keine Unsicherheit, keine Kompromisse — nur verifizierte, 100% glutenfreie Lokale.

---

## Status

**In Entwicklung — Modul M01 abgeschlossen (Setup)**

Das Grundgerüst der App steht: Navigation, Theme, Projektstruktur, ESLint und Prettier sind eingerichtet. Die fünf Haupt-Tabs (Buscar, Comunidad, Mapa, Favoritos, Perfil) sind als Platzhalter vorhanden.

---

## Tech-Stack

| Technologie                   | Verwendung                                        |
| ----------------------------- | ------------------------------------------------- |
| **Expo SDK 52+**              | Cross-Platform-Framework für iOS und Android      |
| **React Native + TypeScript** | UI und typsichere Entwicklung                     |
| **React Navigation 7**        | Bottom-Tab-Navigation zwischen den Hauptbereichen |

Weitere Tools: ESLint, Prettier, `@expo/vector-icons`

---

## Setup

### Voraussetzungen

- [Node.js](https://nodejs.org/) (LTS empfohlen)
- [Expo Go](https://expo.dev/go) auf dem Android-Gerät (oder iOS)

### Installation und Start

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npx expo start
```

### App auf dem Gerät testen

1. `npx expo start` ausführen — im Terminal erscheint ein QR-Code.
2. **Expo Go** auf dem Android-Gerät öffnen.
3. QR-Code scannen — die App lädt auf dem Gerät.

Alternativ im Terminal:

```bash
npm run android   # Android-Emulator
npm run ios       # iOS-Simulator (nur macOS)
npm run web       # Browser-Vorschau
```

### Code-Qualität

```bash
npm run lint      # ESLint — Fehler und Warnungen prüfen
npm run format    # Prettier — Code automatisch formatieren
```

---

## Projektstruktur

```
celiacsafe/
├── App.tsx                 # Einstiegspunkt (SafeArea, Navigation)
├── src/
│   ├── screens/            # Bildschirme der App (Buscar, Mapa, Favoritos, …)
│   ├── components/         # Wiederverwendbare UI-Bausteine
│   ├── navigation/         # React-Navigation-Konfiguration (Bottom Tabs)
│   ├── theme/              # Farben, Schriften, Abstände
│   ├── types/              # TypeScript-Typen und Interfaces
│   ├── data/               # Statische Daten (JSON, Restaurant-Listen)
│   ├── hooks/              # Eigene React-Hooks
│   ├── utils/              # Hilfsfunktionen
│   ├── store/              # App-State-Management
│   └── i18n/               # Übersetzungen (Spanisch, Deutsch, …)
├── assets/                 # Icons, Splash-Screen, Bilder
└── package.json
```

| Ordner            | Beschreibung                                                 |
| ----------------- | ------------------------------------------------------------ |
| `src/screens/`    | Vollständige App-Bildschirme — ein Screen pro Tab oder Flow  |
| `src/components/` | Kleine, wiederverwendbare UI-Teile (Buttons, Karten, Badges) |
| `src/navigation/` | Tab- und Stack-Navigator, Routing-Konfiguration              |
| `src/theme/`      | Zentrales Design-System (Farben, Typografie, Spacing)        |
| `src/types/`      | Gemeinsame TypeScript-Definitionen (Restaurant, Filter, …)   |
| `src/data/`       | Statische JSON-Daten und Daten-Pipeline-Quellen              |
| `src/hooks/`      | Custom Hooks (z. B. Favoriten, Suche, Standort)              |
| `src/utils/`      | Pure Hilfsfunktionen ohne React-Abhängigkeit                 |
| `src/store/`      | Globaler App-State (Context, Zustand o. Ä.)                  |
| `src/i18n/`       | Mehrsprachige Texte und Lokalisierung                        |

---

## Roadmap

| Modul   | Status | Inhalt                                           |
| ------- | ------ | ------------------------------------------------ |
| **M01** | ✅     | Setup — Expo, Navigation, Theme, ESLint/Prettier |
| **M02** | ⏳     | Datenmodell & JSON-Pipeline                      |
| **M03** | ⏳     | Restaurant-Liste                                 |
| **M04** | ⏳     | Filter & Suche                                   |
| **M05** | ⏳     | Karte (Mapa)                                     |
| **M06** | ⏳     | Favoriten                                        |
| **M07** | ⏳     | Profil & Einstellungen                           |
| **M08** | ⏳     | Community (Comunidad)                            |

---

## Lizenz

**Nicht-kommerziell — alle Rechte vorbehalten.**

Dieses Projekt ist urheberrechtlich geschützt. Eine Nutzung, Vervielfältigung oder Weitergabe ohne ausdrückliche schriftliche Genehmigung des Autors ist nicht gestattet.
