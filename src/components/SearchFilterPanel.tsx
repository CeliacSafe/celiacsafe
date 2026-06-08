import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import FilterChipRow from './FilterChipRow';
import FilterSelect, { type FilterSelectOption } from './FilterSelect';
import { SORT_OPTIONS } from '../data/filterOptions';
import { useAppLanguage } from '../i18n/useAppLanguage';
import { COUNTRY_NAMES, VENUE_TYPE_NAMES } from '../i18n/lookups';
import { REGION_NAMES } from '../i18n/regions';
import { useFilterStore } from '../store/filterStore';
import type { Restaurant } from '../types/Restaurant';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { hapticLight } from '../utils/haptics';
import {
  buildFilterOptionContext,
  getAvailableCities,
  getAvailableCountryCodes,
  getDeliveryFilterAvailability,
  getAvailablePriceRanges,
  getAvailableRegionCodes,
  getAvailableVenueTypes,
  poolHasDietOption,
} from '../utils/filterAvailability';
import {
  isKnownCountryCode,
  isKnownRegionCode,
  isKnownVenueTypeCode,
} from '../utils/filterTextMatch';

interface SearchFilterPanelProps {
  restaurants: Restaurant[];
  onClose: () => void;
}

function SearchFilterPanel({ restaurants, onClose }: SearchFilterPanelProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const language = useAppLanguage();

  const searchQuery = useFilterStore((s) => s.searchQuery);
  const selectedCountry = useFilterStore((s) => s.selectedCountry);
  const selectedRegions = useFilterStore((s) => s.selectedRegions);
  const selectedCity = useFilterStore((s) => s.selectedCity);
  const selectedVenueTypes = useFilterStore((s) => s.selectedVenueTypes);
  const selectedPriceRanges = useFilterStore((s) => s.selectedPriceRanges);
  const deliveryAvailable = useFilterStore((s) => s.deliveryAvailable);
  const sortBy = useFilterStore((s) => s.sortBy);
  const minRating = useFilterStore((s) => s.minRating);
  const dietVegan = useFilterStore((s) => s.dietVegan);
  const dietVegetarian = useFilterStore((s) => s.dietVegetarian);
  const onlyFaceCertified = useFilterStore((s) => s.onlyFaceCertified);
  const onlyAoecsCertified = useFilterStore((s) => s.onlyAoecsCertified);
  const categoryTab = useFilterStore((s) => s.categoryTab);

  const setCountrySingle = useFilterStore((s) => s.setCountrySingle);
  const setRegionSingle = useFilterStore((s) => s.setRegionSingle);
  const setSelectedCity = useFilterStore((s) => s.setSelectedCity);
  const setVenueTypeSingle = useFilterStore((s) => s.setVenueTypeSingle);
  const setDeliveryAvailable = useFilterStore((s) => s.setDeliveryAvailable);
  const setSortBy = useFilterStore((s) => s.setSortBy);
  const setPriceRangesAll = useFilterStore((s) => s.setPriceRangesAll);
  const togglePriceRange = useFilterStore((s) => s.togglePriceRange);
  const setDietVegan = useFilterStore((s) => s.setDietVegan);
  const setDietVegetarian = useFilterStore((s) => s.setDietVegetarian);

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

  const availableCountryCodes = useMemo(
    () => getAvailableCountryCodes(restaurants, filterContext),
    [restaurants, filterContext]
  );
  const availableRegionCodes = useMemo(
    () => getAvailableRegionCodes(restaurants, filterContext),
    [restaurants, filterContext]
  );
  const availableCities = useMemo(
    () => getAvailableCities(restaurants, filterContext),
    [restaurants, filterContext]
  );
  const availableVenueTypes = useMemo(
    () => getAvailableVenueTypes(restaurants, filterContext),
    [restaurants, filterContext]
  );
  const availablePriceRanges = useMemo(
    () => getAvailablePriceRanges(restaurants, filterContext),
    [restaurants, filterContext]
  );
  const deliveryFilterAvailability = useMemo(
    () => getDeliveryFilterAvailability(restaurants, filterContext),
    [restaurants, filterContext]
  );
  const hasVeganOption = useMemo(
    () => poolHasDietOption(restaurants, filterContext, 'vegana'),
    [restaurants, filterContext]
  );
  const hasVegetarianOption = useMemo(
    () => poolHasDietOption(restaurants, filterContext, 'vegetariana'),
    [restaurants, filterContext]
  );

  const countryCode = selectedCountry;
  const regionCode = selectedRegions[0] ?? null;
  const venueCode = selectedVenueTypes[0] ?? null;
  const deliveryValue =
    deliveryAvailable === true ? 'yes' : deliveryAvailable === false ? 'no' : null;
  const { hasWithDelivery, hasWithoutDelivery } = deliveryFilterAvailability;
  const showDeliveryFilter = hasWithDelivery && hasWithoutDelivery;

  useEffect(() => {
    if (
      countryCode &&
      isKnownCountryCode(countryCode) &&
      !availableCountryCodes.includes(countryCode)
    ) {
      setCountrySingle(null);
    }
  }, [availableCountryCodes, countryCode, setCountrySingle]);

  useEffect(() => {
    if (
      regionCode &&
      isKnownRegionCode(regionCode) &&
      !availableRegionCodes.includes(regionCode)
    ) {
      setRegionSingle(null);
    }
  }, [availableRegionCodes, regionCode, setRegionSingle]);

  useEffect(() => {
    if (
      venueCode &&
      isKnownVenueTypeCode(venueCode) &&
      !availableVenueTypes.includes(venueCode)
    ) {
      setVenueTypeSingle(null);
    }
  }, [availableVenueTypes, venueCode, setVenueTypeSingle]);

  useEffect(() => {
    if (deliveryAvailable === true && !hasWithDelivery) {
      setDeliveryAvailable(null);
    }
    if (deliveryAvailable === false && !hasWithoutDelivery) {
      setDeliveryAvailable(null);
    }
  }, [deliveryAvailable, hasWithDelivery, hasWithoutDelivery, setDeliveryAvailable]);

  useEffect(() => {
    if (
      selectedPriceRanges.length > 0 &&
      !selectedPriceRanges.every((p) => availablePriceRanges.includes(p))
    ) {
      setPriceRangesAll();
    }
  }, [availablePriceRanges, selectedPriceRanges, setPriceRangesAll]);

  useEffect(() => {
    if (dietVegan && !hasVeganOption) {
      setDietVegan(false);
    }
  }, [dietVegan, hasVeganOption, setDietVegan]);

  useEffect(() => {
    if (dietVegetarian && !hasVegetarianOption) {
      setDietVegetarian(false);
    }
  }, [dietVegetarian, hasVegetarianOption, setDietVegetarian]);

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

  const regionOptions = useMemo(
    () => [
      { value: null, label: t('filter.all_regions') },
      ...availableRegionCodes.map((code) => ({
        value: code,
        label: REGION_NAMES[code as keyof typeof REGION_NAMES]?.[language] ?? code,
      })),
    ],
    [availableRegionCodes, language, t]
  );

  const citySelectOptions = useMemo(
    () => [
      { value: null, label: t('filter.all_cities') },
      ...availableCities.map((city) => ({ value: city, label: city })),
    ],
    [availableCities, t]
  );

  const venueOptions = useMemo(
    () => [
      { value: null, label: t('filter.all') },
      ...availableVenueTypes.map((code) => ({
        value: code,
        label:
          VENUE_TYPE_NAMES[code as keyof typeof VENUE_TYPE_NAMES]?.[language] ?? code,
      })),
    ],
    [availableVenueTypes, language, t]
  );

  const deliveryOptions = useMemo((): FilterSelectOption[] => {
    const options: FilterSelectOption[] = [{ value: null, label: t('filter.all') }];
    if (hasWithDelivery) {
      options.push({ value: 'yes', label: t('common.yes') });
    }
    if (hasWithoutDelivery) {
      options.push({ value: 'no', label: t('common.no') });
    }
    return options;
  }, [hasWithDelivery, hasWithoutDelivery, t]);

  const priceChipId =
    selectedPriceRanges.length === 0 ? 'all' : selectedPriceRanges[0] ?? 'all';

  const priceOptions = [
    { id: 'all', label: t('filter.all') },
    ...availablePriceRanges.map((p) => ({ id: p, label: p })),
  ];

  const countryLabel = countryCode
    ? COUNTRY_NAMES[countryCode as keyof typeof COUNTRY_NAMES]?.[language] ?? countryCode
    : t('filter.all_countries');

  const regionLabel = regionCode
    ? REGION_NAMES[regionCode as keyof typeof REGION_NAMES]?.[language] ?? regionCode
    : t('filter.all_regions');

  const venueLabel = venueCode
    ? VENUE_TYPE_NAMES[venueCode as keyof typeof VENUE_TYPE_NAMES]?.[language] ?? venueCode
    : t('filter.all');

  const deliveryLabel =
    deliveryAvailable === true
      ? t('common.yes')
      : deliveryAvailable === false
        ? t('common.no')
        : t('filter.all');

  const sortOptions = useMemo(
    () => SORT_OPTIONS.map((option) => ({ value: option.code, label: option.labels[language] })),
    [language]
  );
  const sortLabel =
    SORT_OPTIONS.find((option) => option.code === sortBy)?.labels[language] ??
    SORT_OPTIONS[0].labels[language];

  const customInputPlaceholder = t('filter.custom_input');
  const customInputApplyLabel = t('filter.custom_apply');

  return (
    <ScrollView
      style={styles.panelScroll}
      contentContainerStyle={styles.panelContent}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="tune-vertical" size={18} color={colors.textSecondary} />
          <Text style={styles.headerTitle}>{t('filter.panel_title')}</Text>
        </View>
        <Pressable
          onPress={() => {
            hapticLight();
            onClose();
          }}
          hitSlop={8}
        >
          <Text style={styles.close}>{t('filter.close')}</Text>
        </Pressable>
      </View>

      <View style={styles.dropdownRow}>
        <FilterSelect
          flex
          label={t('filter.country')}
          value={countryCode}
          displayValue={countryLabel}
          options={countryOptions}
          onChange={setCountrySingle}
          active={countryCode != null}
          allowCustomInput
          customInputPlaceholder={customInputPlaceholder}
          customInputApplyLabel={customInputApplyLabel}
        />
        <FilterSelect
          flex
          label={t('filter.region')}
          value={regionCode}
          displayValue={regionLabel}
          options={regionOptions}
          onChange={setRegionSingle}
          active={regionCode != null}
          allowCustomInput
          customInputPlaceholder={customInputPlaceholder}
          customInputApplyLabel={customInputApplyLabel}
        />
      </View>

      <View style={styles.dropdownRow}>
        <FilterSelect
          flex
          label={t('filter.city')}
          value={selectedCity}
          displayValue={selectedCity ?? t('filter.all_cities')}
          options={citySelectOptions}
          onChange={setSelectedCity}
          active={selectedCity != null}
          allowCustomInput
          customInputPlaceholder={customInputPlaceholder}
          customInputApplyLabel={customInputApplyLabel}
        />
        <FilterSelect
          flex
          label={t('filter.venue_type')}
          value={venueCode}
          displayValue={venueLabel}
          options={venueOptions}
          onChange={setVenueTypeSingle}
          active={venueCode != null}
          allowCustomInput
          customInputPlaceholder={customInputPlaceholder}
          customInputApplyLabel={customInputApplyLabel}
        />
      </View>

      <View style={styles.dropdownRow}>
        {showDeliveryFilter ? (
          <FilterSelect
            flex
            label={t('filter.delivery')}
            value={deliveryValue}
            displayValue={deliveryLabel}
            options={deliveryOptions}
            onChange={(value) =>
              setDeliveryAvailable(value === 'yes' ? true : value === 'no' ? false : null)
            }
            active={deliveryAvailable != null}
          />
        ) : null}
      </View>

      <View style={styles.dropdownRow}>
        <FilterSelect
          flex
          label={t('search.sort_by')}
          value={sortBy}
          displayValue={sortLabel}
          options={sortOptions}
          onChange={(value) => setSortBy((value ?? 'name_asc') as typeof sortBy)}
          active={sortBy !== 'name_asc'}
        />
      </View>

      {availablePriceRanges.length > 0 ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>{t('filter.price')}</Text>
          <FilterChipRow
            options={priceOptions}
            selectedId={priceChipId}
            onSelect={(id) => {
              if (id === 'all') {
                setPriceRangesAll();
              } else {
                setPriceRangesAll();
                togglePriceRange(id);
              }
            }}
          />
        </View>
      ) : null}

      {hasVeganOption || hasVegetarianOption ? (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>{t('filter.dietary')}</Text>
          <View style={styles.dietRow}>
            {hasVeganOption ? (
              <Pressable
                onPress={() => {
                  hapticLight();
                  setDietVegan(!dietVegan);
                }}
                style={[styles.dietCard, dietVegan && styles.dietCardActive]}
              >
                <MaterialCommunityIcons
                  name="leaf"
                  size={28}
                  color={dietVegan ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.dietLabel, dietVegan && styles.dietLabelActive]}>
                  {t('filter.vegan')}
                </Text>
              </Pressable>
            ) : null}
            {hasVegetarianOption ? (
              <Pressable
                onPress={() => {
                  hapticLight();
                  setDietVegetarian(!dietVegetarian);
                }}
                style={[styles.dietCard, dietVegetarian && styles.dietCardActive]}
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={28}
                  color={dietVegetarian ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.dietLabel, dietVegetarian && styles.dietLabelActive]}>
                  {t('filter.vegetarian')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  panelScroll: {
    maxHeight: 400,
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  panelContent: {
    padding: spacing.cardPadding,
    gap: spacing.md,
  },
  fullWidthField: {
    width: '100%',
  },
  sectionBlock: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  close: {
    ...typography.overline,
    color: colors.heart,
    fontWeight: '700',
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: spacing.cardPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  sectionHint: {
    ...typography.caption,
    flexShrink: 1,
    color: colors.primary,
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'right',
  },
  dietRow: {
    flexDirection: 'row',
    gap: spacing.cardPadding,
  },
  dietCard: {
    flex: 1,
    minHeight: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.cuisineSurface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.cardPadding,
  },
  dietCardActive: {
    borderWidth: 1,
    borderColor: colors.primaryDark,
    backgroundColor: colors.verifiedGreen,
  },
  dietLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dietLabelActive: {
    color: colors.textPrimary,
  },
});

export default SearchFilterPanel;
