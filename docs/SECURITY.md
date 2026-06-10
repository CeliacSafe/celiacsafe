# CeliacSafe — Sicherheit & Betrieb

Checkliste für Admin-Zugang, Supabase-Konfiguration und laufende Wartung.

Siehe auch: [SUPABASE-ADMIN.md](./SUPABASE-ADMIN.md) (Setup), Migrationen in `supabase/migrations/`.

---

## 1. Pflicht-Migrationen (SQL Editor)

In **dieser Reihenfolge** ausführen (falls noch nicht geschehen):

| # | Datei | Inhalt |
|---|--------|--------|
| 005 | `005_add_viewer_role.sql` | Rolle `viewer` (ohne Schreibrechte) |
| 006 | `006_security_hardening.sql` | RLS-Härtung, Rollen-Trennung, Submissions-Validierung |
| 007 | `007_submission_rate_limit.sql` | Rate Limiting für Vorschläge |
| 008 | `008_audit_and_staff_submissions.sql` | Audit-Log-Trigger, `updated_by`, Staff-CSV-Import, Rate-Limit-Ausnahme für Staff |
| 009 | `009_add_premium_partner.sql` | `is_premium_partner`-Flag + Index |
| 010 | `010_enforce_mfa_aal2.sql` | MFA/AAL2 in `is_admin()`/`is_staff()` erzwingen |
| 011 | `011_enable_rls_migrations_table.sql` | RLS auf `_celiacsafe_migrations` (Supabase Lint) |

Lokal (optional): `npm run supabase:migrate` mit `SUPABASE_DB_PASSWORD` in `.env`.

---

## 2. Supabase Auth — Registrierung absichern

**Authentication → Providers → Email**

- [ ] **Confirm email** aktivieren (empfohlen)
- [ ] **Disable sign ups** aktivieren, wenn nur eingeladene Admins/Editoren Zugang bekommen sollen

Neue Nutzer erhalten standardmäßig Rolle **`viewer`** (kein Schreibzugriff). Erst nach manuellem Upgrade:

```sql
-- Editor (Restaurants pflegen, Vorschläge bearbeiten)
update public.profiles set role = 'editor' where id = '<uuid>';

-- Vollzugriff inkl. Profile verwalten, Submissions löschen
update public.profiles set role = 'admin' where id = '<uuid>';
```

**Nur `admin` und `editor`** dürfen ins Web-Admin (`admin-web`). `viewer` sieht „Kein Zugriff“.

---

## 3. MFA (Zwei-Faktor-Authentifizierung)

Empfohlen für alle Admin- und Editor-Konten.

### 3.1 MFA im Supabase-Projekt aktivieren

1. [Supabase Dashboard](https://supabase.com/dashboard) → dein Projekt
2. **Authentication → Providers** (oder **Settings → Auth**)
3. **Multi-Factor Authentication (MOTP/TOTP)** aktivieren
4. Speichern

Dokumentation: [Supabase MFA Guide](https://supabase.com/docs/guides/auth/auth-mfa)

### 3.2 MFA für Admin-Konten einrichten

**Variante A — Supabase Account (Dashboard-Zugang):**  
Separat unter [supabase.com/dashboard/account/security](https://supabase.com/dashboard/account/security) TOTP für den Supabase-Login aktivieren.

**Variante B — Admin-Web-App-User (Auth-User in deinem Projekt):**

1. Im Admin-Web anmelden → **Sicherheit** in der Navigation
2. **Authenticator einrichten** → QR-Code scannen (Google Authenticator, 1Password, …)
3. 6-stelligen Code eingeben → **Aktivieren**

Beim nächsten Login: E-Mail/Passwort → danach **Zwei-Faktor-Code** eingeben.

Das Admin-Web implementiert den vollständigen Supabase-MFA-Flow (`admin-web/src/lib/mfaAuth.ts`, `LoginPage.tsx`, `SecurityPage.tsx`).

### 3.3 MFA serverseitig erzwingen (RLS/AAL2)

Migration `010_enforce_mfa_aal2.sql` koppelt `public.is_admin()` und `public.is_staff()` an
`public.has_satisfied_mfa()`. Wirkung (Supabase-Empfehlung „enforce MFA for users that have it"):

- Nutzer **mit** verifiziertem TOTP-Faktor → Schreib-/Leserechte nur mit **AAL2**-Token (MFA absolviert).
- Nutzer **ohne** Faktor → AAL1 erlaubt, damit die Erst-Einrichtung im Admin-Web möglich bleibt.

Damit greift die MFA-Pflicht nicht nur in der Admin-UI, sondern auch direkt auf REST/RPC-Ebene.
Der letzte verbleibende TOTP-Faktor kann im Admin-Web nicht entfernt werden (`SecurityPage.tsx`).

### 3.4 Passwort-Policy

**Authentication → Settings:**

- Mindestlänge ≥ 12 Zeichen
- Leaked-password protection (HaveIBeenPwned), falls im Plan verfügbar

---

## 4. Rate Limiting — Restaurant-Vorschläge

Migration `007_submission_rate_limit.sql` setzt folgende Grenzen:

| Regel | Limit | Fenster |
|--------|--------|---------|
| Pro E-Mail | 3 Vorschläge | 24 Stunden |
| Global (`source = 'app'`) | 30 Vorschläge | 1 Stunde |
| Duplikat (Name + Stadt) | 1 Vorschlag | 1 Stunde |

Bei Überschreitung wirft die DB eine Exception; die App zeigt eine verständliche Meldung.

**Hinweis:** Staff (Admin/Editor) sind von Rate Limits ausgenommen (Migration 008).

**Anpassen:** Konstanten in `enforce_submission_rate_limit()` in `007_submission_rate_limit.sql` ändern und Migration erneut ausführen (oder `CREATE OR REPLACE FUNCTION` im SQL Editor).

**Hinweis:** Ohne Edge Function ist kein IP-basiertes Limit möglich — nur E-Mail, Global und Duplikat. Für striktes IP-Limiting: [Supabase Edge Function](https://supabase.com/docs/guides/functions) vor dem Insert.

---

## 5. API-Keys & Secrets

| Key | Wo | Regel |
|-----|-----|--------|
| Publishable (`sb_publishable_…`) | App, admin-web, Vercel | Öffentlich OK |
| Secret / Service Role | Nur `.env` lokal, CI Secrets | **Nie** committen, nie ins Frontend |
| `SUPABASE_DB_PASSWORD` | Nur Migrations-Skripte | Gitignored |

---

## 6. Web-Deployment

`vercel.json` setzt u. a.:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(self)`

**Admin-Web** separat deployen (`admin-web/vercel.json` mit Security-Headers inkl. CSP); Auth-Redirect-URLs in Supabase unter **Authentication → URL Configuration** eintragen.

---

## 7. Admin-Web — CSV-Import, Audit & Session-Schutz

- **CSV-Import** (`admin-web/src/lib/csvImport.ts`): max. 2 MB, 500 Zeilen, Pflichtspalten, Feld-Längenlimits; `source: 'admin'` für RLS.
- **Audit-Log** (`/audit`, nur Rolle `admin`): letzte 100 Einträge aus `audit_log` (nach Migration 008).
- **Restaurant-Validierung** (`admin-web/src/lib/restaurantValidation.ts`): Pflichtfelder, Koordinaten, http(s)-URLs vor Speichern.
- **MFA-Pflicht**: Staff ohne eingerichteten TOTP werden auf `/security` geleitet; Rest des Admin-Interfaces gesperrt.
- **Idle-Logout**: Automatische Abmeldung nach 30 Min. Inaktivität (`useIdleLogout`).
- **Login-Schutz (Client)**: Mindestpasswortlänge 12 Zeichen, Lockout nach 5 Fehlversuchen (15 Min.). Der Zähler liegt in `localStorage` (überlebt Reload/neue Tabs) — eine UX-Bremse, keine harte Grenze.
- **Login-Schutz (Server)**: Die verbindliche Drosselung übernimmt **Supabase Auth** (eingebautes Rate Limiting auf `/token`, `/signup`, OTP). Konfigurierbar unter **Authentication → Rate Limits** im Dashboard. Da der clientseitige Guard umgehbar ist (Storage löschen), ist dies die maßgebliche Schutzschicht.

---

## 8. App — Vorschläge & Links

- **Zod-Validierung** (`submissionSchema.ts`) client- und serverseitig (RLS) abgestimmt.
- **Geräte-Cooldown**: 5 Min. zwischen App-Vorschlägen pro Gerät (`submissionCooldown.ts`) — zusätzlich zu DB-Rate-Limits.
- **Honeypot-Feld** im Vorschlagsformular gegen einfache Bots.
- **Sichere URLs** (`safeUrl.ts`): blockiert `javascript:`, `data:` u. a. in `openExternalUrl.ts`.

---

## 9. App — In-App-Admin

Der PIN-Admin in der Mobile-App ist **nur in Dev-Builds** (`__DEV__`) aktiv. Production-Administration ausschließlich über **admin-web** + Supabase Auth.

---

## 10. Regelmäßige Checks

- [ ] Migrationen 005–008 angewendet
- [ ] Öffentliche Sign-ups deaktiviert oder kontrolliert
- [ ] Admin-UUIDs mit `role = 'admin'` dokumentiert (nicht im Git)
- [ ] MFA für Admin-Konten (wo möglich)
- [ ] Dependabot + `npm audit` + Gitleaks (GitHub Actions: `.github/workflows/security.yml`)
- [ ] Nach Schema-Änderungen: `npm run data:export-supabase` + App-Bundle aktualisieren

---

## 11. Incident / Verdacht auf Missbrauch

1. **Authentication → Users** — verdächtige Accounts sperren/löschen
2. SQL: `select * from submissions order by submitted_at desc limit 50;`
3. Temporär Global-Limit verschärfen (Function anpassen)
4. Service-Role-Key rotieren (**Project Settings → API**), `.env` aktualisieren
5. Betroffene Admin-Passwörter zurücksetzen, MFA prüfen
