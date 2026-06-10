import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import SearchQuickDropdown from './SearchQuickDropdown';
import SearchSortButton from './SearchSortButton';
import { useProfileDietaryFilter } from '../hooks/useProfileDietaryFilter';
import { PRIMARY_VENUE_TYPES } from '../data/filterOptions';
import { useAppLanguage } from '../i18n/useAppLanguage';
import { COUNTRY_NAMES, VENUE_TYPE_NAMES } from '../i18n/lookups';
import { useFilterStore } from '../store/filterStore';
import { spacing } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';
import {
  buildFilterOptionContext,
  getAvailableCountryCodes,
  getAvailableVenueTypes,
} from '../utils/filterAvailability';
import { isKnownCountryCode } from '../utils/filterTextMatch';

interface SearchQuickFiltersRowProps {
  restaurants: Restaurant[];
}

function SearchQuickFiltersRow({ restaurants }: SearchQuickFiltersRowProps) {
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
  const setVenueTypeSingle = useFilterStore((s) => s.setVenueTypeSingle);
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

  const countryOptions = useMemo(
    () => [
      { value: null, label: t('filter.all_countries') },
      ...availableCountryCodes.map((code) => ({
        value: code,
        label: COUNTRY_NAMES[code as keyof typeof COUNTRY_NAMES]?.[language] ?? code,
      })),
    ],
    [availableCountryCodes, language, t]
  );

  const venueOptions = useMemo(
    () => [
      { value: null, label: t('filter.all') },
      ...quickVenueCodes.map((code) => ({
        value: code,
        label: VENUE_TYPE_NAMES[code as keyof typeof VENUE_TYPE_NAMES]?.[language] ?? code,
      })),
    ],
    [language, quickVenueCodes, t]
  );

  const countryValue =
    selectedCountry && isKnownCountryCode(selectedCountry) ? selectedCountry : null;

  const venueCode = selectedVenueTypes[0] ?? null;
  const venueValue =
    venueCode && quickVenueCodes.includes(venueCode as (typeof quickVenueCodes)[number])
      ? venueCode
      : null;

  const countryDisplay =
    countryOptions.find((option) => option.value === countryValue)?.label ??
    t('filter.all_countries');

  const venueDisplay =
    venueOptions.find((option) => option.value === venueValue)?.label ?? t('filter.all');

  const showCountry = countryOptions.length > 1;
  const showVenue = venueOptions.length > 1;

  if (!showCountry && !showVenue) {
    return (
      <View style={styles.row}>
        <SearchSortButton inline />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {showCountry ? (
        <SearchQuickDropdown
          accessibilityLabel={t('filter.country')}
          displayValue={countryDisplay}
          value={countryValue}
          options={countryOptions}
          onChange={(value) => setCountrySingle(value)}
          active={countryValue != null}
        />
      ) : null}
      {showVenue ? (
        <SearchQuickDropdown
          accessibilityLabel={t('filter.venue_type')}
          displayValue={venueDisplay}
          value={venueValue}
          options={venueOptions}
          onChange={(value) => setVenueTypeSingle(value)}
          active={venueValue != null}
        />
      ) : null}
      <SearchSortButton inline />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sm,
  },
});

export default SearchQuickFiltersRow;
