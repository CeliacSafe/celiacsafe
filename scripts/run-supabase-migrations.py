#!/usr/bin/env python3
"""
Führt supabase/migrations/*.sql gegen die Postgres-DB aus.

Benötigt in .env (eine Option):
  SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
  — oder —
  SUPABASE_DB_PASSWORD=...  (Projekt-Ref aus SUPABASE_URL wird abgeleitet)

Dashboard: Project Settings → Database → Connection string (URI, Session pooler).
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

try:
    from dotenv import load_dotenv
    import psycopg2
except ImportError:
    print("Fehler: pip install python-dotenv psycopg2-binary")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
MIGRATIONS = sorted((ROOT / "supabase" / "migrations").glob("*.sql"))


def db_url_from_env() -> str:
    direct = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
    if direct:
        return direct

    password = os.getenv("SUPABASE_DB_PASSWORD")
    base = os.getenv("SUPABASE_URL", "")
    m = re.search(r"https://([^.]+)\.supabase\.co", base)
    if password and m:
        ref = m.group(1)
        return (
            f"postgresql://postgres.{ref}:{password}"
            f"@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
        )

    print(
        "Fehler: SUPABASE_DB_URL oder SUPABASE_DB_PASSWORD in .env setzen.\n"
        "Dashboard → Project Settings → Database → Connection string"
    )
    sys.exit(1)


def run_file(cur, path: Path) -> None:
    sql = path.read_text(encoding="utf-8")
    print(f"  → {path.name}")
    cur.execute(sql)


def main() -> None:
    load_dotenv(ROOT / ".env")
    url = db_url_from_env()

    if not MIGRATIONS:
        print("Keine Migrationen in supabase/migrations/")
        sys.exit(1)

    print(f"Verbinde mit Supabase Postgres ({len(MIGRATIONS)} Dateien)…")
    conn = psycopg2.connect(url)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            for path in MIGRATIONS:
                run_file(cur, path)
        print("Migrationen erfolgreich.")
    except Exception as e:
        print(f"Fehler: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
