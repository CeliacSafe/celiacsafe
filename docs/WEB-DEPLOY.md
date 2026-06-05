# CeliacSafe Web — Deployment (Vercel)

Die Web-App wird als statischer Export unter `dist/` gebaut (`npm run web:export`). Für Hosting ist [Vercel](https://vercel.com) vorkonfiguriert (`vercel.json` im Projektroot).

## Voraussetzungen

- Git-Repository mit diesem Projekt (z. B. GitHub)
- Vercel-Konto (kostenloser Hobby-Plan reicht)
- Supabase-Keys für Live-Sync (optional, App läuft auch mit eingebettetem `restaurants.json`)

## Einmalige Einrichtung

### 1. Projekt bei Vercel anlegen

1. [vercel.com/new](https://vercel.com/new) öffnen und das Git-Repository importieren.
2. Vercel erkennt `vercel.json` automatisch:
   - **Build Command:** `npm run web:export`
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci`
3. Unter **Environment Variables** (Production + Preview) setzen:

   | Variable | Wert |
   |----------|------|
   | `EXPO_PUBLIC_SUPABASE_URL` | Supabase-Projekt-URL |
   | `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable Key (`sb_publishable_…`) |

   Diese Werte stehen auch in `.env.example` / lokaler `.env`.

4. **Deploy** starten.

Nach dem ersten Deploy ist die App unter `https://<projekt>.vercel.app` erreichbar. Jeder Push auf `main` löst automatisch ein neues Deployment aus.

### 2. Eigene Domain (optional)

Vercel Dashboard → **Settings** → **Domains** → Domain hinzufügen und DNS-Einträge beim Provider setzen (Vercel zeigt die nötigen Records).

## Lokaler Test des Production-Builds

```bash
npm run web:export
npx serve dist
```

Oder in einem Schritt:

```bash
npm run web:preview
```

Dann im Browser `http://localhost:3000` öffnen.

## Manuelles Deploy mit Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Umgebungsvariablen werden aus dem Vercel-Projekt übernommen oder interaktiv abgefragt.

## CI (GitHub Actions)

Workflow `.github/workflows/web-build.yml`:

- baut bei Push/PR auf `main` den Web-Export
- lädt `dist/` als Artifact hoch (7 Tage Aufbewahrung)

Optional die gleichen GitHub Secrets `EXPO_PUBLIC_SUPABASE_URL` und `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` hinterlegen, damit der CI-Build echte Keys nutzt.

## Hinweise

- `dist/` ist in `.gitignore` — Vercel baut bei jedem Deploy neu.
- Die Kartenansicht im Web nutzt statische OSM-Vorschauen (kein `react-native-maps`).
- Admin-Interface (`admin-web/`) ist ein separates Vite-Projekt und wird von dieser Konfiguration **nicht** mit deployed.
