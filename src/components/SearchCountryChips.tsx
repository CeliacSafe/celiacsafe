import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import FilterChipRow from './FilterChipRow';
import { useProfileDietaryFilter } from '../hooks/useProfileDietaryFilter';
import { useAppLanguage } from '../i18n/useAppLanguage';
import { COUNTRY_NAMES } from '../i18n/lookups';
import { useFilterStore } from '../store/filterStore';
import type { Restaurant } from '../types/Restaurant';
import { spacing } from '../theme/spacing';
import {
  buildFilterOptionContext,
  getAvailableCountryCodes,
} from '../utils/filterAvailability';
import { isKnownCountryCode } from '../utils/filterTextMatch';

interface SearchCountryChipsProps {
  restaurants: Restaurant[];
  /** Kompaktere Darstellung auf der Karte */
  compact?: boolean;
}

function SearchCountryChips({ restaurants, compact = false }: SearchCountryChipsProps) {
  const { t } = useTranslation();
  const language = useAppLanguage();

  const searchQuery = useFilterStore((s) => s.searchQuery);
  const selectedVenueTypes = useFilterStore((s) => s.selectedVenueTypes);
  const selectedRegions = useFilterStore((s) => s.selectedRegions);
  const selectedPriceRanges = useFilterStore((s) => s.selectedPriceRanges);
  const selectedCountry = useFilterStore((s) => s.selectedCountry);
  const selectedCity = useFilterStore((s) => s.selectedCity);
  const deliveryAvailable = useFilterStore((s) => s.deliveryAvailable);
  const onlyFaceCertified = useFilterStore((s) => s.onlyFaceCertified);
  const onlyAoecsCertified = useFilterStore((s) => s.onlyAoecsCertified);
  const dietVegan = useFilterStore((s) => s.dietVegan);
  const dietVegetarian = useFilterStore((s) => s.dietVegetarian);
  const dietLactoseFree = useFilterStore((s) => s.dietLactoseFree);
  const minRating = useFilterStore((s) => s.minRating);
  const categoryTab = useFilterStore((s) => s.categoryTab);
  const setCountrySingle = useFilterStore((s) => s.setCountrySingle);
  const profileDietary = useProfileDietaryFilter();

  const filterContext = useMemo(
    () =>
      buildFilterOptionContext({
        searchQuery,
        selectedVenueTypes,
        selectedRegions,
        selectedPriceRanges,
        selectedCountry,
        selectedCity,
        deliveryAvailable,
        onlyFaceCertified,
        onlyAoecsCertified,
        dietVegan,
        dietVegetarian,
        dietLactoseFree,
        minRating,
        categoryTab,
        profileDietary,
      }),
    [
      searchQuery,
      selectedVenueTypes,
      selectedRegions,
      selectedPriceRanges,
      selectedCountry,
      selectedCity,
      deliveryAvailable,
      onlyFaceCertified,
      onlyAoecsCertified,
      dietVegan,
      dietVegetarian,
      dietLactoseFree,
      minRating,
      categoryTab,
      profileDietary,
    ]
  );

  const availableCountryCodes = useMemo(
    () => getAvailableCountryCodes(restaurants, filterContext),
    [restaurants, filterContext]
  );

  if (availableCountryCodes.length <= 1 && !selectedCountry) {
    return null;
  }

  const chips = [
    { id: 'all', label: t('filter.all_countries') },
    ...availableCountryCodes.map((code) => ({
      id: code,
      label: COUNTRY_NAMES[code as keyof typeof COUNTRY_NAMES]?.[language] ?? code,
    })),
  ];

  const selectedId =
    selectedCountry && isKnownCountryCode(selectedCountry) ? selectedCountry : 'all';

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <FilterChipRow
        options={chips}
        selectedId={selectedId}
        onSelect={(id) => setCountrySingle(id === 'all' ? null : id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sm,
  },
  wrapCompact: {
    paddingTop: spacing.xs,
  },
});

export default SearchCountryChips;
