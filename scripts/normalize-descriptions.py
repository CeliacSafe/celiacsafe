#!/usr/bin/env python3
"""
CeliacSafe — Beschreibungen vereinheitlichen (DE/EN/ES).

1. Ersetzt interne Audit-Texte in ``description_de`` (DE-Seed-Restaurants).
2. Leitet aus den deutschen Template-Texten konsistente, natuerliche
   EN- und ES-Beschreibungen ab und schreibt sie in die Excel-Workbooks.

Die deutschen Texte folgen festen Mustern (Kategorie + Stadt); die Stadt wird
per Regex aus dem DE-Text uebernommen, damit alle Sprachen identisch sind.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Any

try:
    from openpyxl import load_workbook
except ImportError:
    print("Fehler: openpyxl nicht installiert.")
    print("Bitte: pip install -r scripts/requirements.txt")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_TARGETS = [
    ROOT / "data-source" / "CeliacSafe_Datenbank_v4_Spain_129_geocoded.xlsx",
    ROOT / "data-source" / "CeliacSafe_Datenbank_v4_Germany_Delta_Consolidated_geocoded.xlsx",
]

# ─── Templates: DE-Muster (Stadt als Capture-Gruppe) → EN/ES ────────────────

TEMPLATES: list[dict[str, str]] = [
    {
        "de": r"Restaurant in (?P<city>.+?) mit Tapas, mediterranen Gerichten, Fisch-/Fleischspeisen und spanisch inspirierten Klassikern\.",
        "en": "Restaurant in {city} serving tapas, Mediterranean dishes, fish and meat specialities, and Spanish-inspired classics.",
        "es": "Restaurante en {city} con tapas, platos mediterráneos, pescados y carnes, y clásicos de inspiración española.",
    },
    {
        "de": r"Healthy-Restaurant/Café in (?P<city>.+?) mit Bowls, Brunchgerichten, Salaten, herzhaften Speisen, Kuchen und Getränken\.",
        "en": "Health-focused restaurant and café in {city} offering bowls, brunch dishes, salads, savoury plates, cakes, and drinks.",
        "es": "Restaurante y cafetería saludable en {city} con bowls, platos de brunch, ensaladas, platos salados, tartas y bebidas.",
    },
    {
        "de": r"Italienisches Restaurant in (?P<city>.+?) mit Pizza, Pasta, Antipasti und weiteren mediterranen Gerichten\.",
        "en": "Italian restaurant in {city} serving pizza, pasta, antipasti, and other Mediterranean dishes.",
        "es": "Restaurante italiano en {city} con pizza, pasta, antipasti y otros platos mediterráneos.",
    },
    {
        "de": r"Bäckerei/Patisserie in (?P<city>.+?) mit Brot, Brötchen, Kuchen, Torten, Gebäck, süßen Backwaren und teilweise herzhaften Snacks\.",
        "en": "Bakery and patisserie in {city} offering bread, rolls, cakes, tarts, pastries, sweet baked goods, and a selection of savoury snacks.",
        "es": "Panadería y pastelería en {city} con pan, panecillos, tartas, pasteles, bollería, dulces y algunos snacks salados.",
    },
    {
        "de": r"Restaurant/Bistro in (?P<city>.+?) mit Vorspeisen, Hauptgerichten, Desserts und je nach Konzept regionaler, mediterraner oder internationaler Küche\.",
        "en": "Restaurant and bistro in {city} serving starters, main courses, and desserts, with regional, Mediterranean, or international cuisine depending on the concept.",
        "es": "Restaurante y bistró en {city} con entrantes, platos principales y postres; cocina regional, mediterránea o internacional según el concepto.",
    },
    {
        "de": r"Take-away-Konzept in (?P<city>.+?) mit vorbereiteten Speisen, Snacks, Backwaren und Gerichten zum Mitnehmen\.",
        "en": "Takeaway concept in {city} offering prepared meals, snacks, baked goods, and dishes to go.",
        "es": "Concepto take-away en {city} con comidas preparadas, snacks, productos de panadería y platos para llevar.",
    },
    {
        "de": r"Veganes bzw\. plant-based Café/Restaurant in (?P<city>.+?) mit Bowls, Kuchen, Frühstücksgerichten, Snacks und kreativer pflanzlicher Küche\.",
        "en": "Vegan, plant-based café and restaurant in {city} offering bowls, cakes, breakfast dishes, snacks, and creative plant-based cuisine.",
        "es": "Cafetería y restaurante vegano en {city} con bowls, tartas, desayunos, snacks y cocina vegetal creativa.",
    },
    {
        "de": r"Japanisches Restaurant in (?P<city>.+?) mit Sushi, warmen japanischen Gerichten, Reisgerichten und Desserts\.",
        "en": "Japanese restaurant in {city} serving sushi, hot Japanese dishes, rice dishes, and desserts.",
        "es": "Restaurante japonés en {city} con sushi, platos japoneses calientes, platos de arroz y postres.",
    },
    {
        "de": r"Croquetería in (?P<city>.+?) mit verschiedenen Croquetas, kleinen herzhaften Gerichten und Take-away-Angebot\.",
        "en": "Croquette specialist in {city} offering a variety of croquetas, small savoury dishes, and takeaway.",
        "es": "Croquetería en {city} con croquetas variadas, pequeños platos salados y opción para llevar.",
    },
    {
        "de": r"Burgerrestaurant in (?P<city>.+?) mit Burgern, Beilagen, Saucen und Casual-Food-Gerichten\.",
        "en": "Burger restaurant in {city} serving burgers, sides, sauces, and casual food.",
        "es": "Hamburguesería en {city} con hamburguesas, acompañamientos, salsas y comida informal.",
    },
    {
        "de": r"Mexikanisches Restaurant in (?P<city>.+?) mit Tacos, Nachos, Salsas, Bowls und weiteren mexikanischen Klassikern\.",
        "en": "Mexican restaurant in {city} serving tacos, nachos, salsas, bowls, and other Mexican classics.",
        "es": "Restaurante mexicano en {city} con tacos, nachos, salsas, bowls y otros clásicos mexicanos.",
    },
    {
        "de": r"Café in (?P<city>.+?) mit Kaffee, Frühstück, Kuchen, Gebäck, Brunchgerichten und kleinen Speisen\.",
        "en": "Café in {city} offering coffee, breakfast, cakes, pastries, brunch dishes, and light bites.",
        "es": "Cafetería en {city} con café, desayunos, tartas, bollería, platos de brunch y comidas ligeras.",
    },
    {
        "de": r"Pizzeria in (?P<city>.+?) mit Pizza, herzhaften Ofengerichten und italienisch inspirierten Speisen\.",
        "en": "Pizzeria in {city} serving pizza, savoury oven-baked dishes, and Italian-inspired food.",
        "es": "Pizzería en {city} con pizza, platos al horno y cocina de inspiración italiana.",
    },
    {
        "de": r"Restaurant in (?P<city>.+?) mit regionaler Küche, Hauptgerichten, Vorspeisen, Desserts und saisonalen Speisen\.",
        "en": "Restaurant in {city} serving regional cuisine, main courses, starters, desserts, and seasonal dishes.",
        "es": "Restaurante en {city} con cocina regional, platos principales, entrantes, postres y platos de temporada.",
    },
    {
        "de": r"Lateinamerikanisches Restaurant/Café in (?P<city>.+?) mit Tapioca, Arepas, Empanadas, Bowls und herzhaften Snacks\.",
        "en": "Latin American restaurant and café in {city} serving tapioca, arepas, empanadas, bowls, and savoury snacks.",
        "es": "Restaurante y café latinoamericano en {city} con tapioca, arepas, empanadas, bowls y snacks salados.",
    },
]

# ─── Gängige Exonyme für Städtenamen in EN/ES ───────────────────────────────

CITY_EXONYMS_EN: dict[str, str] = {
    "München": "Munich",
    "Köln": "Cologne",
    "Sevilla": "Seville",
}

CITY_EXONYMS_ES: dict[str, str] = {
    "Berlin": "Berlín",
    "München": "Múnich",
    "Köln": "Colonia",
    "Hamburg": "Hamburgo",
    "Frankfurt am Main": "Fráncfort del Meno",
    "Aachen": "Aquisgrán",
    "Regensburg": "Ratisbona",
}

COMPILED_TEMPLATES = [
    {
        "pattern": re.compile(f"^{template['de']}$"),
        "en": template["en"],
        "es": template["es"],
    }
    for template in TEMPLATES
]

# ─── DE-Seed-Restaurants: Audit-Text → richtiges Kategorie-Template ─────────

DE_TEMPLATE_BAKERY = (
    "Bäckerei/Patisserie in {city} mit Brot, Brötchen, Kuchen, Torten, Gebäck, "
    "süßen Backwaren und teilweise herzhaften Snacks."
)
DE_TEMPLATE_VEGAN = (
    "Veganes bzw. plant-based Café/Restaurant in {city} mit Bowls, Kuchen, "
    "Frühstücksgerichten, Snacks und kreativer pflanzlicher Küche."
)

SEED_DE_FIXES: dict[str, str] = {
    "DE-011": DE_TEMPLATE_BAKERY.format(city="Berlin"),
    "DE-012": DE_TEMPLATE_BAKERY.format(city="Berlin"),
    "DE-013": DE_TEMPLATE_BAKERY.format(city="Berlin"),
    "DE-014": DE_TEMPLATE_BAKERY.format(city="Berlin"),
    "DE-016": DE_TEMPLATE_BAKERY.format(city="Essen"),
    "DE-017": DE_TEMPLATE_BAKERY.format(city="Düsseldorf"),
    "DE-022": DE_TEMPLATE_VEGAN.format(city="Frankfurt am Main"),
    "DE-023": DE_TEMPLATE_BAKERY.format(city="Wiesbaden"),
    "DE-025": DE_TEMPLATE_BAKERY.format(city="Lorch"),
}


def normalize_header(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip().lower().replace(" ", "_")


def krumcoffee_copy(city: str) -> dict[str, str]:
    city_en = CITY_EXONYMS_EN.get(city, city)
    city_es = CITY_EXONYMS_ES.get(city, city)
    return {
        "de": (
            f"100% glutenfreies KrümCoffee-Café in {city} mit Kaffee, Frühstück, "
            f"Brunch, Kuchen, Gebäck und herzhaften Snacks."
        ),
        "en": (
            f"100% gluten-free KrümCoffee café in {city_en} serving coffee, breakfast, "
            f"brunch, cakes, pastries, and savoury snacks."
        ),
        "es": (
            f"Cafetería KrümCoffee 100% sin gluten en {city_es} con café, desayuno, "
            f"brunch, tartas, bollería y snacks salados."
        ),
    }


def is_krumcoffee(name: Any) -> bool:
    text = str(name or "").lower()
    return "krümcoffee" in text or "krumcoffee" in text or "krüm coffee" in text


def translate_from_german(description_de: str) -> tuple[str, str] | None:
    """Gibt (en, es) zurueck, wenn der DE-Text einem Template entspricht."""
    text = description_de.strip()
    for template in COMPILED_TEMPLATES:
        match = template["pattern"].match(text)
        if match:
            city = match.group("city")
            return (
                template["en"].format(city=CITY_EXONYMS_EN.get(city, city)),
                template["es"].format(city=CITY_EXONYMS_ES.get(city, city)),
            )
    return None


def apply_to_workbook(workbook_path: Path) -> dict[str, Any]:
    workbook = load_workbook(workbook_path)
    stats = {"seed_de_fixed": 0, "special_copy": 0, "en_set": 0, "es_set": 0, "unmatched": []}

    if "restaurants" not in workbook.sheetnames:
        workbook.close()
        return stats

    sheet = workbook["restaurants"]
    header_row = next(sheet.iter_rows(min_row=1, max_row=1, values_only=True))
    headers = [normalize_header(cell) for cell in header_row]
    cols = {header: index for index, header in enumerate(headers) if header}

    required = {"id", "name", "city", "description_de", "description_en", "description_es"}
    missing = required - set(cols)
    if missing:
        workbook.close()
        raise ValueError(f"Spalten fehlen in {workbook_path.name}: {missing}")

    for row_index in range(2, sheet.max_row + 1):
        restaurant_id = sheet.cell(row=row_index, column=cols["id"] + 1).value
        if not restaurant_id:
            continue
        restaurant_id = str(restaurant_id).strip()

        de_cell = sheet.cell(row=row_index, column=cols["description_de"] + 1)
        description_de = str(de_cell.value or "").strip()
        name = sheet.cell(row=row_index, column=cols["name"] + 1).value
        city = str(sheet.cell(row=row_index, column=cols["city"] + 1).value or "").strip()

        if is_krumcoffee(name) and city:
            copy = krumcoffee_copy(city)
            de_cell.value = copy["de"]
            sheet.cell(row=row_index, column=cols["description_en"] + 1, value=copy["en"])
            sheet.cell(row=row_index, column=cols["description_es"] + 1, value=copy["es"])
            stats["special_copy"] += 1
            stats["en_set"] += 1
            stats["es_set"] += 1
            continue

        if restaurant_id in SEED_DE_FIXES:
            description_de = SEED_DE_FIXES[restaurant_id]
            de_cell.value = description_de
            stats["seed_de_fixed"] += 1

        if not description_de:
            continue

        translated = translate_from_german(description_de)
        if not translated:
            stats["unmatched"].append((restaurant_id, description_de[:60]))
            continue

        en_text, es_text = translated
        sheet.cell(row=row_index, column=cols["description_en"] + 1, value=en_text)
        sheet.cell(row=row_index, column=cols["description_es"] + 1, value=es_text)
        stats["en_set"] += 1
        stats["es_set"] += 1

    workbook.save(workbook_path)
    workbook.close()
    return stats


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Vereinheitlicht DE/EN/ES-Beschreibungen in den Excel-Workbooks."
    )
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
    for target in targets:
        if not target.exists():
            print(f"Warnung: Ziel nicht gefunden, uebersprungen: {target}")
            continue

        stats = apply_to_workbook(target)
        print(f"\n{target.name}")
        print(f"  DE-Seed-Texte ersetzt: {stats['seed_de_fixed']}")
        print(f"  Spezial-Texte (z. B. KrümCoffee): {stats['special_copy']}")
        print(f"  description_en gesetzt: {stats['en_set']}")
        print(f"  description_es gesetzt: {stats['es_set']}")
        if stats["unmatched"]:
            print(f"  Ohne Template-Treffer: {len(stats['unmatched'])}")
            for restaurant_id, snippet in stats["unmatched"]:
                print(f"    {restaurant_id}: {snippet}")


if __name__ == "__main__":
    main()
