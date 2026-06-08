import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import FilterChipRow from './FilterChipRow';
import { PRIMARY_VENUE_TYPES } from '../data/filterOptions';
import { useAppLanguage } from '../i18n/useAppLanguage';
import { VENUE_TYPE_NAMES } from '../i18n/lookups';
import { useFilterStore } from '../store/filterStore';
import type { Restaurant } from '../types/Restaurant';
import { spacing } from '../theme/spacing';
import {
  buildFilterOptionContext,
  getAvailableVenueTypes,
} from '../utils/filterAvailability';

interface SearchVenueTypeChipsProps {
  restaurants: Restaurant[];
}

function SearchVenueTypeChips({ restaurants }: SearchVenueTypeChipsProps) {
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
  const minRating = useFilterStore((s) => s.minRating);
  const categoryTab = useFilterStore((s) => s.categoryTab);
  const setVenueTypeSingle = useFilterStore((s) => s.setVenueTypeSingle);

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
        minRating,
        categoryTab,
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
      minRating,
      categoryTab,
    ]
  );

  const availableVenueTypes = useMemo(
    () => getAvailableVenueTypes(restaurants, filterContext),
    [restaurants, filterContext]
  );

  const quickVenueCodes = useMemo(
    () =>
      PRIMARY_VENUE_TYPES.map((entry) => entry.code).filter((code) =>
        availableVenueTypes.includes(code)
      ),
    [availableVenueTypes]
  );

  if (quickVenueCodes.length === 0) {
    return null;
  }

  const venueCode = selectedVenueTypes[0] ?? null;

  const chips = [
    { id: 'all', label: t('filter.all') },
    ...quickVenueCodes.map((code) => ({
      id: code,
      label: VENUE_TYPE_NAMES[code as keyof typeof VENUE_TYPE_NAMES]?.[language] ?? code,
    })),
  ];

  const selectedId =
    venueCode && quickVenueCodes.includes(venueCode as (typeof quickVenueCodes)[number])
      ? venueCode
      : 'all';

  return (
    <View style={styles.wrap}>
      <FilterChipRow
        options={chips}
        selectedId={selectedId}
        onSelect={(id) => setVenueTypeSingle(id === 'all' ? null : id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.screenPadding,
  },
});

export default SearchVenueTypeChips;
