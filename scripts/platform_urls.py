"""
URL-Helfer fuer Liefer- und Reservierungsplattformen.

Wird von excel-to-json.py und enrich-excel-links.py genutzt.
Logik spiegelt src/utils/platformLinks.ts (App-Fallbacks).
"""

from __future__ import annotations

import re
from typing import Any
from urllib.parse import quote

# Excel-Varianten → kanonische Plattform-Codes (Restaurant.ts)
PLATFORM_ALIASES: dict[str, str] = {
    "the_fork": "thefork",
    "thefork": "thefork",
    "the fork": "thefork",
    "eltenedor": "thefork",
    "lafourchette": "thefork",
    "glovo": "glovo",
    "uber_eats": "uber_eats",
    "uber eats": "uber_eats",
    "ubereats": "uber_eats",
    "just_eat": "just_eat",
    "just eat": "just_eat",
    "justeat": "just_eat",
    "wolt": "wolt",
    "deliveroo": "deliveroo",
    "own_delivery": "own_delivery",
    "no_delivery": "no_delivery",
    "opentable": "opentable",
    "quandoo": "quandoo",
    "own_website": "own_website",
    "phone_only": "phone_only",
    "walk_in_only": "walk_in_only",
    "instagram_dm": "instagram_dm",
    "reservator": "own_website",
    "lieferando": "lieferando",
}

# Optionale Spalten im Blatt ``restaurants`` (snake_case)
RESTAURANT_INLINE_URL_FIELDS: dict[str, tuple[str, str]] = {
    "thefork_url": ("thefork", "reservation"),
    "glovo_url": ("glovo", "delivery"),
    "uber_eats_url": ("uber_eats", "delivery"),
    "just_eat_url": ("just_eat", "delivery"),
    "wolt_url": ("wolt", "delivery"),
    "deliveroo_url": ("deliveroo", "delivery"),
}

ENRICHABLE_DELIVERY = frozenset(
    {"glovo", "uber_eats", "just_eat", "wolt", "deliveroo", "own_delivery"}
)
ENRICHABLE_RESERVATION = frozenset({"thefork", "opentable", "quandoo", "own_website"})


def normalize_platform(value: Any) -> str | None:
    if value is None:
        return None
    raw = str(value).strip().lower().replace("-", "_")
    if not raw:
        return None
    return PLATFORM_ALIASES.get(raw, raw.replace(" ", "_"))


def normalize_url(url: str) -> str:
    trimmed = url.strip()
    if re.match(r"^https?://", trimmed, re.I):
        return trimmed
    return f"https://{trimmed}"


def is_usable_url(url: Any) -> bool:
    return bool(url and str(url).strip())


def search_query(restaurant: dict[str, Any]) -> str:
    parts = [restaurant.get("name"), restaurant.get("city")]
    return " ".join(str(p).strip() for p in parts if p and str(p).strip())


def build_thefork_url(restaurant: dict[str, Any], explicit: str | None = None) -> str | None:
    if is_usable_url(explicit):
        return normalize_url(str(explicit))
    slug = restaurant.get("slug")
    if slug and str(slug).strip():
        slug_clean = re.sub(r"[^\w\-]+", "-", str(slug).strip().lower()).strip("-")
        if slug_clean:
            return f"https://www.thefork.es/restaurant/{slug_clean}"
    q = quote(search_query(restaurant))
    return f"https://www.thefork.es/buscar?query={q}" if q else None


def build_glovo_url(restaurant: dict[str, Any], explicit: str | None = None) -> str | None:
    if is_usable_url(explicit):
        return normalize_url(str(explicit))
    q = quote(search_query(restaurant))
    return f"https://glovoapp.com/es/search?query={q}" if q else None


def build_uber_eats_url(restaurant: dict[str, Any], explicit: str | None = None) -> str | None:
    if is_usable_url(explicit):
        return normalize_url(str(explicit))
    q = quote(search_query(restaurant))
    return f"https://www.ubereats.com/es/search?q={q}" if q else None


def build_just_eat_url(restaurant: dict[str, Any], explicit: str | None = None) -> str | None:
    if is_usable_url(explicit):
        return normalize_url(str(explicit))
    q = quote(search_query(restaurant))
    return f"https://www.just-eat.es/buscar?q={q}" if q else None


def build_wolt_url(restaurant: dict[str, Any], explicit: str | None = None) -> str | None:
    if is_usable_url(explicit):
        return normalize_url(str(explicit))
    q = quote(search_query(restaurant))
    return f"https://wolt.com/es/search?q={q}" if q else None


def build_deliveroo_url(restaurant: dict[str, Any], explicit: str | None = None) -> str | None:
    if is_usable_url(explicit):
        return normalize_url(str(explicit))
    q = quote(search_query(restaurant))
    return f"https://deliveroo.es/es/search?query={q}" if q else None


def build_opentable_url(restaurant: dict[str, Any], explicit: str | None = None) -> str | None:
    if is_usable_url(explicit):
        return normalize_url(str(explicit))
    q = quote(search_query(restaurant))
    return f"https://www.opentable.es/s?term={q}" if q else None


def build_quandoo_url(restaurant: dict[str, Any], explicit: str | None = None) -> str | None:
    if is_usable_url(explicit):
        return normalize_url(str(explicit))
    q = quote(search_query(restaurant))
    return f"https://www.quandoo.es/resultados?query={q}" if q else None


def build_own_website_url(restaurant: dict[str, Any], explicit: str | None = None) -> str | None:
    if is_usable_url(explicit):
        return normalize_url(str(explicit))
    website = restaurant.get("website")
    if is_usable_url(website):
        return normalize_url(str(website))
    return None


def build_own_delivery_url(restaurant: dict[str, Any], explicit: str | None = None) -> str | None:
    if is_usable_url(explicit):
        return normalize_url(str(explicit))
    website = restaurant.get("website")
    if is_usable_url(website):
        return normalize_url(str(website))
    return None


BUILDERS: dict[str, Any] = {
    "thefork": build_thefork_url,
    "glovo": build_glovo_url,
    "uber_eats": build_uber_eats_url,
    "just_eat": build_just_eat_url,
    "wolt": build_wolt_url,
    "deliveroo": build_deliveroo_url,
    "opentable": build_opentable_url,
    "quandoo": build_quandoo_url,
    "own_website": build_own_website_url,
    "own_delivery": build_own_delivery_url,
}


def build_url_for_platform(
    platform: str, restaurant: dict[str, Any], explicit: str | None = None
) -> str | None:
    builder = BUILDERS.get(platform)
    if not builder:
        return normalize_url(str(explicit)) if is_usable_url(explicit) else None
    return builder(restaurant, explicit)


def enrich_link_url(link: dict[str, Any], restaurant: dict[str, Any]) -> dict[str, Any]:
    """Fuellt leere url-Felder; normalisiert vorhandene URLs."""
    platform = link.get("platform")
    if not platform:
        return link

    explicit = link.get("url") or ""
    if is_usable_url(explicit):
        link["url"] = normalize_url(str(explicit))
        return link

    built = build_url_for_platform(platform, restaurant, None)
    if built:
        link["url"] = built
    else:
        link["url"] = ""

    return link


def extract_inline_urls_from_row(row: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    """Liest optionale *_url-Spalten aus dem restaurants-Blatt."""
    delivery: list[dict[str, Any]] = []
    reservation: list[dict[str, Any]] = []

    for field, (platform, kind) in RESTAURANT_INLINE_URL_FIELDS.items():
        raw = row.get(field)
        if raw is None or str(raw).strip() == "":
            continue
        entry = {
            "platform": platform,
            "url": normalize_url(str(raw).strip()),
            "is_active": True,
        }
        if kind == "delivery":
            delivery.append(entry)
        else:
            reservation.append(entry)

    return {"delivery": delivery, "reservation": reservation}


def merge_link_lists(
    sheet_links: list[dict[str, Any]],
    inline_links: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Excel-Blatt hat Vorrang; Inline-URLs ergaenzen fehlende Plattformen."""
    by_platform: dict[str, dict[str, Any]] = {}

    for link in sheet_links:
        platform = link.get("platform")
        if platform:
            by_platform[platform] = link

    for link in inline_links:
        platform = link.get("platform")
        if not platform:
            continue
        existing = by_platform.get(platform)
        if existing is None:
            by_platform[platform] = link
        elif not is_usable_url(existing.get("url")) and is_usable_url(link.get("url")):
            merged = {**existing, "url": link["url"]}
            by_platform[platform] = merged

    return list(by_platform.values())


def dedupe_links_by_platform(links: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Eine Zeile pro Plattform; bevorzugt Eintraege mit URL."""
    by_platform: dict[str, dict[str, Any]] = {}
    for link in links:
        platform = link.get("platform")
        if not platform:
            continue
        current = by_platform.get(platform)
        if current is None:
            by_platform[platform] = link
            continue
        if not is_usable_url(current.get("url")) and is_usable_url(link.get("url")):
            by_platform[platform] = link
    return list(by_platform.values())


def enrich_restaurant_links(
    restaurant: dict[str, Any],
    delivery_links: list[dict[str, Any]] | None,
    reservation_links: list[dict[str, Any]] | None,
) -> tuple[list[dict[str, Any]] | None, list[dict[str, Any]] | None, dict[str, int]]:
    """
    Reichert Liefer- und Reservierungslinks an.

    Returns:
        (delivery_links, reservation_links, stats)
    """
    stats = {"delivery_enriched": 0, "reservation_enriched": 0}

    enriched_delivery: list[dict[str, Any]] | None = None
    if delivery_links:
        deduped = dedupe_links_by_platform(delivery_links)
        enriched_delivery = []
        for link in deduped:
            before = link.get("url") or ""
            enriched = enrich_link_url(dict(link), restaurant)
            if not is_usable_url(before) and is_usable_url(enriched.get("url")):
                if link.get("platform") in ENRICHABLE_DELIVERY:
                    stats["delivery_enriched"] += 1
            enriched_delivery.append(enriched)

    enriched_reservation: list[dict[str, Any]] | None = None
    if reservation_links:
        deduped = dedupe_links_by_platform(reservation_links)
        enriched_reservation = []
        for link in deduped:
            before = link.get("url") or ""
            enriched = enrich_link_url(dict(link), restaurant)
            if not is_usable_url(before) and is_usable_url(enriched.get("url")):
                if link.get("platform") in ENRICHABLE_RESERVATION:
                    stats["reservation_enriched"] += 1
            enriched_reservation.append(enriched)

    return enriched_delivery, enriched_reservation, stats
