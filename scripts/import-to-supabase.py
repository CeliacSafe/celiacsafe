#!/usr/bin/env python3
"""
Importiert src/data/restaurants.json nach Supabase (EU).

Voraussetzungen:
  pip install -r scripts/requirements.txt
  .env mit SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY

Verwendung:
  python scripts/import-to-supabase.py
  python scripts/import-to-supabase.py --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

try:
    from dotenv import load_dotenv
    from supabase import Client, create_client
except ImportError:
    print("Fehler: pip install python-dotenv supabase")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_JSON = ROOT / "src" / "data" / "restaurants.json"


def restaurant_row(r: dict) -> dict:
    """Flache Restaurant-Zeile für Postgres."""
    row = {
        "id": r["id"],
        "name": r["name"],
        "country_code": r.get("country_code", "ES"),
        "region_code": r["region_code"],
        "region_name": r["region_name"],
        "city": r["city"],
        "verification_status": r.get("verification_status", "to_be_verified"),
        "is_published": r.get("is_published", True),
        "is_hidden": r.get("is_hidden", False),
    }
    optional = [
        "slug", "province", "district", "postal_code", "address_street",
        "latitude", "longitude", "venue_type", "price_range",
        "last_verified_at", "national_authority", "phone", "whatsapp",
        "email", "website", "menu_url", "google_maps_url", "apple_maps_url",
        "instagram", "facebook", "opening_hours",
        "seasonal_closure", "description_es", "description_en", "description_de",
        "featured_image_url",
    ]
    for key in optional:
        if r.get(key) not in (None, ""):
            row[key] = r[key]
    for key in ("cuisine_types", "meal_types", "verification_methods"):
        if r.get(key):
            row[key] = r[key]
    for key in ("face_program", "aoecs_certified"):
        if r.get(key) is not None:
            row[key] = r[key]
    return row


def upsert_links(client: Client, restaurant_id: str, links: list, table: str) -> None:
    for link in links:
        if not link.get("platform"):
            continue
        client.table(table).upsert(
            {
                "restaurant_id": restaurant_id,
                "platform": link["platform"],
                "url": link.get("url") or "",
                "is_active": link.get("is_active", True),
            },
            on_conflict="restaurant_id,platform",
        ).execute()


def main() -> None:
    parser = argparse.ArgumentParser(description="JSON → Supabase importieren")
    parser.add_argument("--input", type=Path, default=DEFAULT_JSON)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    load_dotenv(ROOT / ".env")

    url = os.getenv("SUPABASE_URL")
    key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_SECRET_KEY")
    )
    if not url or not key:
        print(
            "Fehler: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY (oder SUPABASE_SECRET_KEY) in .env setzen"
        )
        sys.exit(1)

    if not args.input.exists():
        print(f"Fehler: {args.input} nicht gefunden")
        sys.exit(1)

    payload = json.loads(args.input.read_text(encoding="utf-8"))
    restaurants = payload.get("restaurants", [])
    print(f"Lade {len(restaurants)} Restaurants aus {args.input.name}")

    if args.dry_run:
        print("Dry-run — keine Schreiboperationen.")
        return

    client = create_client(url, key)

    for item in restaurants:
        rid = item["id"]
        client.table("restaurants").upsert(restaurant_row(item), on_conflict="id").execute()
        upsert_links(client, rid, item.get("delivery_links") or [], "delivery_links")
        upsert_links(client, rid, item.get("reservation_links") or [], "reservation_links")

    print(f"Fertig: {len(restaurants)} Restaurants in Supabase.")


if __name__ == "__main__":
    main()
