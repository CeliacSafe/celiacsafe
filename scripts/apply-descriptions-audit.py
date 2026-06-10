#!/usr/bin/env python3
"""
CeliacSafe — Official website descriptions audit in Excel-Workbooks einspielen.

Liest ``official_description_audit`` und schreibt ``description_de``,
``description_en`` und ``description_es`` ins Blatt ``restaurants``.

Mapping:
  - ES-IDs: direkt
  - DE-IDs (z. B. BER-001): Name + Stadt → Workbook-ID
"""

from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_AUDIT = (
    ROOT
    / "data-source"
    / "CeliacSafe_Official_Website_Descriptions_Audit_ES_DE_181.xlsx"
)
DEFAULT_TARGETS = [
    ROOT / "data-source" / "CeliacSafe_Datenbank_v4_Spain_129_geocoded.xlsx",
    ROOT / "data-source" / "CeliacSafe_Datenbank_v4_Germany_Delta_Consolidated_geocoded.xlsx",
]

AUDIT_MARKERS: tuple[re.Pattern[str], ...] = tuple(
    re.compile(pattern, re.IGNORECASE)
    for pattern in [
        r"offiziell(er|en)?\s+auftritt",
        r"als\s+100\s*%\s*gluten",
        r"100\s*%\s*gluten",
        r"für die app",
        r"geeignet\s+für",
        r"verifizier",
        r"kontamin",
        r"beschrieben",
        r"weist\s+.*\s+aus",
    ]
)


def is_audit_style_description(text: str) -> bool:
    cleaned = text.strip()
    if not cleaned:
        return False
    return any(marker.search(cleaned) for marker in AUDIT_MARKERS)


def normalize_header(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip().lower().replace(" ", "_")


def normalize_key(name: Any, city: Any) -> tuple[str, str]:
    def norm(part: Any) -> str:
        if part is None:
            return ""
        text = unicodedata.normalize("NFKD", str(part))
        text = text.encode("ascii", "ignore").decode("ascii").lower()
        return re.sub(r"[^a-z0-9]+", " ", text).strip()

    return norm(name), norm(city)


def parse_string(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def read_sheet_rows(workbook: Any, sheet_name: str) -> list[dict[str, Any]]:
    if sheet_name not in workbook.sheetnames:
        return []
    worksheet = workbook[sheet_name]
    rows = worksheet.iter_rows(values_only=True)
    try:
        headers = [normalize_header(cell) for cell in next(rows)]
    except StopIteration:
        return []
    records: list[dict[str, Any]] = []
    for values in rows:
        if not values or all(value in (None, "") for value in values):
            continue
        records.append(
            {
                headers[col_index]: values[col_index]
                for col_index in range(len(headers))
                if headers[col_index]
            }
        )
    return records


def build_workbook_lookups(workbook_path: Path) -> tuple[set[str], dict[tuple[str, str], str]]:
    workbook = load_workbook(workbook_path, read_only=True, data_only=True)
    restaurant_rows = read_sheet_rows(workbook, "restaurants")
    workbook.close()

    ids: set[str] = set()
    by_name_city: dict[tuple[str, str], str] = {}
    for row in restaurant_rows:
        restaurant_id = row.get("id")
        if not restaurant_id:
            continue
        restaurant_id = str(restaurant_id).strip()
        ids.add(restaurant_id)
        by_name_city[normalize_key(row.get("name"), row.get("city"))] = restaurant_id
    return ids, by_name_city


def map_audit_row_to_workbook_id(
    row: dict[str, Any],
    workbook_ids: set[str],
    by_name_city: dict[tuple[str, str], str],
) -> str | None:
    audit_id = str(row.get("restaurant_id", "")).strip()
    if audit_id in workbook_ids:
        return audit_id
    return by_name_city.get(normalize_key(row.get("name"), row.get("city")))


def description_updates_from_audit_row(row: dict[str, Any]) -> dict[str, str]:
    """Nur echte Website-Beschreibungen — keine App-Audit-Empfehlungen."""
    updates: dict[str, str] = {}

    for field, source_key in (
        ("description_de", "description_de_from_site_or_validation"),
        ("description_en", "description_en_from_site_or_validation"),
        ("description_es", "description_es_from_site_or_validation"),
    ):
        value = parse_string(row.get(source_key))
        if value and not is_audit_style_description(value):
            updates[field] = value

    return updates


def collect_applicable_updates(
    audit_rows: list[dict[str, Any]],
    workbook_ids: set[str],
    by_name_city: dict[tuple[str, str], str],
) -> dict[str, dict[str, str]]:
    applicable: dict[str, dict[str, str]] = {}

    for row in audit_rows:
        workbook_id = map_audit_row_to_workbook_id(row, workbook_ids, by_name_city)
        if not workbook_id:
            continue

        updates = description_updates_from_audit_row(row)
        if not updates:
            continue

        existing = applicable.setdefault(workbook_id, {})
        existing.update(updates)

    return applicable


def apply_to_workbook(
    workbook_path: Path,
    updates_by_id: dict[str, dict[str, str]],
) -> dict[str, int]:
    workbook = load_workbook(workbook_path)
    stats = {
        "matched": 0,
        "description_de": 0,
        "description_en": 0,
        "description_es": 0,
    }

    if "restaurants" not in workbook.sheetnames:
        workbook.close()
        return stats

    sheet = workbook["restaurants"]
    header_row = next(sheet.iter_rows(min_row=1, max_row=1, values_only=True))
    headers = [normalize_header(cell) for cell in header_row]
    header_cols = {header: index for index, header in enumerate(headers) if header}

    if "id" not in header_cols:
        workbook.close()
        raise ValueError(f"'id'-Spalte fehlt in {workbook_path.name}")

    id_col = header_cols["id"] + 1
    for row_index, values in enumerate(
        sheet.iter_rows(min_row=2, values_only=True),
        start=2,
    ):
        if not values:
            continue
        restaurant_id = values[header_cols["id"]]
        if not restaurant_id:
            continue
        restaurant_id = str(restaurant_id).strip()
        updates = updates_by_id.get(restaurant_id)
        if not updates:
            continue

        stats["matched"] += 1
        for field, value in updates.items():
            if field not in header_cols:
                continue
            sheet.cell(row=row_index, column=header_cols[field] + 1, value=value)
            stats[field] += 1

    workbook.save(workbook_path)
    workbook.close()
    return stats


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Spielt Official-Website-Descriptions-Audit in Excel ein."
    )
    parser.add_argument("-i", "--input", type=Path, default=DEFAULT_AUDIT)
    parser.add_argument(
        "-t",
        "--target",
        type=Path,
        action="append",
        dest="targets",
        help="Ziel-Workbook (mehrfach moeglich)",
    )
    args = parser.parse_args()

    targets = args.targets or DEFAULT_TARGETS
    if not args.input.exists():
        print(f"Fehler: Audit-Datei nicht gefunden: {args.input}")
        sys.exit(1)

    workbook = load_workbook(args.input, read_only=True, data_only=True)
    audit_rows = read_sheet_rows(workbook, "official_description_audit")
    workbook.close()

    print(f"Audit: {len(audit_rows)} Beschreibungszeilen")

    for target in targets:
        if not target.exists():
            print(f"Warnung: Ziel nicht gefunden, uebersprungen: {target}")
            continue

        workbook_ids, by_name_city = build_workbook_lookups(target)
        updates = collect_applicable_updates(audit_rows, workbook_ids, by_name_city)
        stats = apply_to_workbook(target, updates)
        print(f"\n{target.name}")
        print(f"  Gemappte Restaurants: {stats['matched']}")
        print(f"  description_de: {stats['description_de']}")
        print(f"  description_en: {stats['description_en']}")
        print(f"  description_es: {stats['description_es']}")


if __name__ == "__main__":
    main()
