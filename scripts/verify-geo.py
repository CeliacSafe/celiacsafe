#!/usr/bin/env python3
"""
CeliacSafe — Kurzpruefung der Geo-Koordinaten in restaurants.json.

Verwendung::

    python scripts/verify-geo.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_JSON = ROOT / "src" / "data" / "restaurants.json"

# Spanien inkl. Kanaren und Ceuta/Melilla (grobe Bounding-Box)
LAT_MIN, LAT_MAX = 27.0, 44.0
LNG_MIN, LNG_MAX = -19.0, 5.0


def main() -> None:
    json_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_JSON

    if not json_path.exists():
        print(f"Fehler: Datei nicht gefunden: {json_path}")
        sys.exit(1)

    payload = json.loads(json_path.read_text(encoding="utf-8"))
    restaurants = payload.get("restaurants", payload)
    if not isinstance(restaurants, list):
        print("Fehler: Ungueltiges JSON-Format (restaurants-Array fehlt).")
        sys.exit(1)

    total = len(restaurants)
    with_coords = 0
    outside_spain: list[str] = []
    missing: list[str] = []

    for restaurant in restaurants:
        name = restaurant.get("name") or restaurant.get("id") or "?"
        lat = restaurant.get("latitude")
        lng = restaurant.get("longitude")

        if lat is None or lng is None:
            missing.append(name)
            continue

        try:
            lat_f = float(lat)
            lng_f = float(lng)
        except (TypeError, ValueError):
            missing.append(name)
            continue

        with_coords += 1

        if not (LAT_MIN <= lat_f <= LAT_MAX and LNG_MIN <= lng_f <= LNG_MAX):
            outside_spain.append(
                f"{name}: lat={lat_f:.4f}, lng={lng_f:.4f} (Stadt: {restaurant.get('city', '?')})"
            )

    print(f"{with_coords} von {total} Restaurants haben Koordinaten")

    if missing:
        print(f"\nOhne Koordinaten ({len(missing)}):")
        for entry in missing[:15]:
            print(f"  - {entry}")
        if len(missing) > 15:
            print(f"  ... und {len(missing) - 15} weitere")

    if outside_spain:
        print(f"\nAuffaellig — ausserhalb Spanien-Bounding-Box ({len(outside_spain)}):")
        for entry in outside_spain:
            print(f"  - {entry}")
    else:
        print("Alle Koordinaten liegen innerhalb der Spanien-Bounding-Box.")

    if with_coords < total or outside_spain:
        sys.exit(1)


if __name__ == "__main__":
    main()
