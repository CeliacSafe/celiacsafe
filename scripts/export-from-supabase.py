#!/usr/bin/env python3
"""
Exportiert veröffentlichte Restaurants aus Supabase nach src/data/restaurants.json.

Verwendung:
  python scripts/export-from-supabase.py
  python scripts/export-from-supabase.py -o src/data/restaurants.json
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

try:
    from dotenv import load_dotenv
    from supabase import create_client
except ImportError:
    print("Fehler: pip install python-dotenv supabase")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT = ROOT / "src" / "data" / "restaurants.json"

EXPORT_FIELDS = [
    "id", "name", "slug", "country_code", "region_code", "region_name",
    "province", "city", "district", "postal_code", "address_street",
    "latitude", "longitude", "venue_type", "cuisine_types", "price_range",
    "meal_types", "verification_status", "verification_methods",
    "last_verified_at", "face_program", "aoecs_certified", "national_authority",
    "phone", "whatsapp", "email", "website", "menu_url", "instagram", "facebook",
    "opening_hours", "seasonal_closure", "description_es", "description_en",
    "description_de", "featured_image_url",
]


def slim_restaurant(row: dict, delivery: list, reservation: list) -> dict:
    out = {k: row[k] for k in EXPORT_FIELDS if row.get(k) not in (None, "", [])}
    if delivery:
        out["delivery_links"] = delivery
    if reservation:
        out["reservation_links"] = reservation
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="Supabase → restaurants.json")
    parser.add_argument("-o", "--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    load_dotenv(ROOT / ".env")
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("Fehler: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in .env setzen")
        sys.exit(1)

    client = create_client(url, key)

    res = (
        client.table("restaurants")
        .select("*")
        .eq("is_published", True)
        .eq("is_hidden", False)
        .execute()
    )
    rows = res.data or []

    restaurants = []
    for row in rows:
        rid = row["id"]
        d = client.table("delivery_links").select("platform,url,is_active").eq("restaurant_id", rid).execute()
        r = client.table("reservation_links").select("platform,url,is_active").eq("restaurant_id", rid).execute()
        restaurants.append(
            slim_restaurant(row, d.data or [], r.data or [])
        )

    restaurants.sort(key=lambda x: x["name"])

    payload = {
        "_meta": {
            "version": "2.0.0",
            "count": len(restaurants),
            "source": "supabase-export",
        },
        "restaurants": restaurants,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Exportiert: {len(restaurants)} → {args.output}")


if __name__ == "__main__":
    main()
