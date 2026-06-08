# CeliacSafe — Supabase EU (Admin & Datenbank)

Zentrale Datenbank in **Supabase Region EU (Frankfurt)** + **Web-Admin am PC** + Import/Export zur bestehenden App.

---

## Architektur

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Expo App       │     │  admin-web       │     │  Python-Skripte │
│  (Nutzer)       │     │  (Browser am PC) │     │  import/export  │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │ anon key              │ Auth (Admin)            │ service role
         └───────────────────────┼─────────────────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │  Supabase EU (Postgres) │
                    │  restaurants            │
                    │  delivery_links         │
                    │  reservation_links      │
                    │  submissions            │
                    └────────────────────────┘
                                 │
                                 ▼ export-from-supabase.py
                    ┌────────────────────────┐
                    │  src/data/restaurants.json │
                    │  (App-Bundle, Übergang)    │
                    └────────────────────────┘
```

**Phase 1:** DB + Web-Admin + JSON-Export (Fallback / Build ohne Netz)  
**Phase 2 (aktiv):** App synchronisiert von Supabase + AsyncStorage-Cache; Vorschläge → `submissions`

---

## Schnellstart (Stand: Phase 1 aktiv)

**Erledigt:** Supabase-Projekt EU, Schema, 107 Restaurants importiert, Admin-User, Web-Admin, JSON-Export-Skript.

**Regelmäßig:** Nach DB-Änderungen `npm run data:export-supabase` → App-Bundle aktualisieren.

### Schritt 1 — Schema (2 Min., einmalig)

1. Datei **`supabase/apply_all.sql`** öffnen (alle Migrationen kombiniert)
2. Alles markieren → **Kopieren**
3. [SQL Editor CeliacSafe](https://supabase.com/dashboard/project/ltlblmwjnbcqwenxdrfh/sql/new) → einfügen → **Run**
4. Erwartung: grünes **Success** (kein Fehler „already exists“ beim ersten Mal)

### Schritt 2 — Restaurants importieren

```powershell
cd C:\Dev\celiacsafe
node scripts/import-to-supabase.mjs
```

(~107 Restaurants aus `src/data/restaurants.json`)

### Schritt 3 — Admin für Web-Panel

1. Supabase → **Authentication → Users → Add user**
2. SQL Editor:

```sql
update public.profiles set role = 'admin' where id = 'DEINE-USER-UUID';
```

### Schritt 4 — Web-Admin testen

```powershell
cd C:\Dev\celiacsafe\admin-web
npm install
npm run dev
```

→ http://localhost:5173 mit Admin-E-Mail anmelden

### Schritt 5 — Optional: JSON für App aktualisieren

```powershell
npm run data:export-supabase
npm run start:lan
```

### Phase 2 (App, erledigt)

- `useRestaurants` lädt von Supabase (`syncRestaurantsFromSupabase`), Cache in AsyncStorage
- Offline: letzter Cache oder `src/data/restaurants.json`
- Pull-to-refresh in der Suche → erneuter Sync
- Restaurant-Vorschläge → `submissions` (E-Mail nur noch Fallback)

**Optional später:** In-App-PIN-Admin entfernen (nur Web-Admin)

---

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. **Region:** `Europe (Frankfurt) — eu-central-1` ✅
3. Starkes DB-Passwort notieren
4. Warten bis Projekt bereit ist

### API-Keys

**Project Settings → API:**

| Key | Verwendung |
|-----|------------|
| `Publishable key` `sb_publishable_...` | App + admin-web (Client) |
| `Secret key` `sb_secret_...` | **Nur** Python-Skripte lokal — nie in Git/App! |

---

## Supabase-Dashboard vs. dieses Projekt

Das Supabase-Dashboard zeigt oft **Next.js**-Code (`NEXT_PUBLIC_*`, `cookies()`, Middleware).  
**CeliacSafe ist kein Next.js-Projekt** — die Entsprechungen:

| Supabase-Wizard (Next.js) | CeliacSafe |
|---------------------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env`: `EXPO_PUBLIC_*` (App) / `VITE_*` (admin-web) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | gleicher Publishable Key, anderes Präfix |
| `utils/supabase/server.ts` + `cookies()` | **Nicht nötig** — kein Server-Rendering |
| `utils/supabase/middleware.ts` | **Nicht nötig** — Vite SPA, kein Next.js |
| `createBrowserClient` (@supabase/ssr) | `admin-web/src/lib/supabase.ts` |
| `createClient` + AsyncStorage | `src/lib/supabase.ts` (Expo App) |

**Expo App** (`src/lib/supabase.ts`):

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { storage: AsyncStorage, persistSession: true } },
);
```

**Web-Admin** (`admin-web/src/lib/supabase.ts`):

```typescript
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
```

`@supabase/ssr` in der **Root-`package.json`** ist für Expo **optional** — nur admin-web braucht es für den Browser-Client.

---

## 2. Schema deployen

Im Supabase Dashboard → **SQL Editor** → New query:

1. Inhalt von `supabase/migrations/001_initial_schema.sql` einfügen → **Run**
2. Inhalt von `supabase/migrations/002_new_user_profile.sql` → **Run**

Oder mit [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase login
supabase link --project-ref DEIN-PROJECT-REF
supabase db push
```

---

## 3. Ersten Admin anlegen

1. **Authentication → Users → Add user** (E-Mail + Passwort)
2. UUID des Users kopieren
3. SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = 'DEINE-USER-UUID';
```

Nur `admin` / `editor` dürfen laut RLS Daten schreiben.

---

## 4. Umgebungsvariablen

### Projekt-Root (`C:\Dev\celiacsafe\.env`)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Kopie aus `.env.example`. **`.env` nicht committen.**

### Web-Admin (`admin-web/.env`)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 5. Bestehende Daten importieren

```powershell
cd C:\Dev\celiacsafe
pip install -r scripts/requirements.txt

# Test ohne Schreiben:
python scripts/import-to-supabase.py --dry-run

# Import:
python scripts/import-to-supabase.py
```

Liest `src/data/restaurants.json` (107 Restaurants) → Supabase.

---

## 6. Web-Admin am Computer starten

```powershell
cd C:\Dev\celiacsafe\admin-web
copy .env.example .env
# .env mit URL + anon key füllen

npm install
npm run dev
```

Browser: **http://localhost:5173** → mit Admin-E-Mail anmelden.

| Seite | Funktion |
|-------|----------|
| Dashboard | Statistik |
| Restaurants | Liste, Ein-/Ausblenden |
| Vorschläge | Freigeben / Ablehnen |
| CSV Import | Bulk-Upload |

**Deployment (optional):** `npm run build` → Vercel/Netlify, Env-Vars setzen, Auth-Redirect-URLs in Supabase eintragen.

---

## 7. Änderungen in die App bringen

**Übergang (ohne App-Code-Änderung):**

```powershell
python scripts/export-from-supabase.py
npm run start:lan
```

Schreibt frische `restaurants.json` aus der DB.

**Später:** App-Sync via `@supabase/supabase-js` + lokaler Cache (Phase 2).

---

## 8. Vorschläge aus der App (Phase 2)

App sendet an Supabase (anon key erlaubt INSERT):

```typescript
await supabase.from('submissions').insert({
  id: `sub_app_${Date.now()}`,
  restaurant_name: name,
  city,
  submission_notes: notes,
  source: 'app',
});
```

Admins sehen alles im Web-Admin unter **Vorschläge**.

---

## 9. Sicherheit & DSGVO

Ausführliche Checkliste: **[docs/SECURITY.md](./SECURITY.md)** (Migrationen 005–007, MFA, Rate Limits, Sign-up absichern).

| Thema | Maßnahme |
|-------|----------|
| Region | **Frankfurt (EU)** |
| Admin-Zugriff | Supabase Auth, Rollen in `profiles` (`admin` / `editor` / `viewer`) |
| Öffentliche App | Publishable key: nur SELECT veröffentlichter Restaurants + INSERT submissions (validiert + rate-limited) |
| Service Role | Nur lokal für Import/Export |
| MFA | Empfohlen für Admin-Konten — siehe SECURITY.md |
| Rate Limits | 3/E-Mail/24h, 30 App/Stunde, keine Duplikate (Name+Stadt/1h) |
| Audit | Tabelle `audit_log` (optional befüllen) |
| Datenschutz | Submissions enthalten ggf. E-Mail — Privacy-Text anpassen |

**In-App-PIN-Admin** nur noch in Dev-Builds; Production über Web-Admin.

---

## 10. NPM-Skripte (Root)

```json
"data:import-supabase": "python scripts/import-to-supabase.py",
"data:export-supabase": "python scripts/export-from-supabase.py"
```

---

## Dateien im Repo

| Pfad | Inhalt |
|------|--------|
| `supabase/migrations/*.sql` | DB-Schema + RLS |
| `scripts/import-to-supabase.py` | JSON → DB |
| `scripts/export-from-supabase.py` | DB → JSON |
| `admin-web/` | React-Admin für PC |
| `.env.example` | Vorlage Keys |

---

## Nächste Schritte (Empfehlung)

1. ✅ Supabase EU Projekt + Schema + Admin-User  
2. ✅ `import-to-supabase.py` ausführen  
3. ✅ `admin-web` lokal testen  
4. Vorschläge-Formular in App → Supabase INSERT  
5. `useRestaurants()` → API + Offline-Cache  
6. In-App-Admin optional entfernen oder als API-Client belassen
