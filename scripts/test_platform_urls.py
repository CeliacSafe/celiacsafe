"""Tests fuer scripts/platform_urls.py — ausfuehren: python scripts/test_platform_urls.py"""

from __future__ import annotations

import unittest

from platform_urls import (
    build_glovo_url,
    build_thefork_url,
    build_uber_eats_url,
    enrich_link_url,
    merge_link_lists,
    normalize_platform,
)


class PlatformUrlsTests(unittest.TestCase):
    def test_normalize_platform_aliases(self) -> None:
        self.assertEqual(normalize_platform("Uber Eats"), "uber_eats")
        self.assertEqual(normalize_platform("the_fork"), "thefork")

    def test_thefork_from_slug(self) -> None:
        restaurant = {
            "name": "As de Bastos",
            "city": "Madrid",
            "slug": "as-de-bastos-madrid",
        }
        url = build_thefork_url(restaurant)
        self.assertIsNotNone(url)
        assert url is not None
        self.assertIn("thefork", url)
        self.assertIn("as-de-bastos-madrid", url)

    def test_glovo_search_without_url(self) -> None:
        restaurant = {"name": "Test", "city": "Palma"}
        url = build_glovo_url(restaurant)
        self.assertIn("glovoapp.com", url or "")

    def test_enrich_empty_glovo_link(self) -> None:
        restaurant = {"name": "As de Bastos", "city": "Madrid", "slug": "x"}
        link = {"platform": "glovo", "url": "", "is_active": True}
        enriched = enrich_link_url(link, restaurant)
        self.assertTrue(enriched["url"].startswith("https://"))

    def test_merge_inline_over_empty_sheet_url(self) -> None:
        sheet = [{"platform": "glovo", "url": "", "is_active": True}]
        inline = [{"platform": "glovo", "url": "https://glovoapp.com/test", "is_active": True}]
        merged = merge_link_lists(sheet, inline)
        self.assertEqual(merged[0]["url"], "https://glovoapp.com/test")

    def test_uber_eats_builder(self) -> None:
        url = build_uber_eats_url({"name": "Cafe", "city": "Barcelona"})
        self.assertIn("ubereats.com", url or "")


if __name__ == "__main__":
    unittest.main()
