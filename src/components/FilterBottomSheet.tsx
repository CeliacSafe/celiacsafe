/**
 * Bottom-Sheet fuer erweiterte Filteroptionen (Region, Preis, Verifizierung, Sortierung).
 * Die Filter wirken sofort auf die Liste; der Apply-Button schliesst das Sheet nur.
 */

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SORT_OPTIONS } from '../data/filterOptions';
import { useAppLanguage } from '../i18n/useAppLanguage';
import { REGION_NAMES } from '../i18n/regions';
import { useRestaurants } from '../hooks/useRestaurants';
import { useFilterStore } from '../store/filterStore';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import { hapticMedium } from '../utils/haptics';
import {
  buildFilterOptionContext,
  getAvailablePriceRanges,
  getAvailableRegionCodes,
} from '../utils/filterAvailability';
import { applyFilters } from '../utils/searchAndFilter';

export interface FilterBottomSheetRef {
  expand: () => void;
  close: () => void;
}

const SORT_LABEL_KEYS = {
  name_asc: 'search.sort_name_asc',
  name_desc: 'search.sort_name_desc',
  recently_verified: 'search.sort_recently_verified',
} as const;

const FilterBottomSheet = forwardRef<FilterBottomSheetRef>((_props, ref) => {
  const { t } = useTranslation();
  const language = useAppLanguage();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['85%'], []);

  const { restaurants } = useRestaurants();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const selectedVenueTypes = useFilterStore((state) => state.selectedVenueTypes);
  const selectedRegions = useFilterStore((state) => state.selectedRegions);
  const selectedPriceRanges = useFilterStore((state) => state.selectedPriceRanges);
  const selectedCity = useFilterStore((state) => state.selectedCity);
  const selectedDeliveryPlatform = useFilterStore((state) => state.selectedDeliveryPlatform);
  const onlyFaceCertified = useFilterStore((state) => state.onlyFaceCertified);
  const onlyAoecsCertified = useFilterStore((state) => state.onlyAoecsCertified);
  const sortBy = useFilterStore((state) => state.sortBy);
  const minRating = useFilterStore((state) => state.minRating);
  const categoryTab = useFilterStore((state) => state.categoryTab);
  const dietVegan = useFilterStore((state) => state.dietVegan);
  const dietVegetarian = useFilterStore((state) => state.dietVegetarian);

  const toggleRegion = useFilterStore((state) => state.toggleRegion);
  const togglePriceRange = useFilterStore((state) => state.togglePriceRange);
  const setFaceFilter = useFilterStore((state) => state.setFaceFilter);
  const setAoecsFilter = useFilterStore((state) => state.setAoecsFilter);
  const setSortBy = useFilterStore((state) => state.setSortBy);
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters);

  const filterCriteria = useMemo(
    () => ({
      selectedVenueTypes,
      selectedRegions,
      selectedPriceRanges,
      onlyFaceCertified,
      onlyAoecsCertified,
      selectedCity,
      selectedDeliveryPlatform,
      dietVegan,
      dietVegetarian,
      minRating,
      categoryTab,
    }),
    [
      selectedVenueTypes,
      selectedRegions,
      selectedPriceRanges,
      onlyFaceCertified,
      onlyAoecsCertified,
      selectedCity,
      selectedDeliveryPlatform,
      dietVegan,
      dietVegetarian,
      minRating,
      categoryTab,
    ]
  );

  const filterContext = useMemo(
    () =>
      buildFilterOptionContext({
        searchQuery,
        selectedVenueTypes,
        selectedRegions,
        selectedPriceRanges,
        selectedCity,
        selectedDeliveryPlatform,
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
      selectedCity,
      selectedDeliveryPlatform,
      onlyFaceCertified,
      onlyAoecsCertified,
      dietVegan,
      dietVegetarian,
      minRating,
      categoryTab,
    ]
  );

  const availableRegions = useMemo(
    () => getAvailableRegionCodes(restaurants, filterContext),
    [restaurants, filterContext]
  );

  const availablePriceRanges = useMemo(
    () => getAvailablePriceRanges(restaurants, filterContext),
    [restaurants, filterContext]
  );

  const resultCount = useMemo(
    () => applyFilters(restaurants, searchQuery, filterCriteria, sortBy).length,
    [restaurants, searchQuery, filterCriteria, sortBy]
  );

  useImperativeHandle(ref, () => ({
    expand: () => sheetRef.current?.expand(),
    close: () => sheetRef.current?.close(),
  }));

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('filter.title')}</Text>
          {hasActiveFilters() ? (
            <Pressable
              onPress={() => {
                hapticMedium();
                resetFilters();
              }}
            >
              <Text style={styles.clearText}>{t('filter.reset')}</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>{t('filter.region')}</Text>
        <View style={styles.chipsWrap}>
          {availableRegions.map((regionCode) => {
            const active = selectedRegions.includes(regionCode);
            return (
              <Pressable
                key={regionCode}
                onPress={() => toggleRegion(regionCode)}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    active ? styles.chipLabelActive : styles.chipLabelInactive,
                  ]}
                >
                  {REGION_NAMES[regionCode][language]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>{t('filter.price')}</Text>
        <View style={styles.chipsWrap}>
          {availablePriceRanges.map((range) => {
            const active = selectedPriceRanges.includes(range);
            return (
              <Pressable
                key={range}
                onPress={() => togglePriceRange(range)}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    active ? styles.chipLabelActive : styles.chipLabelInactive,
                  ]}
                >
                  {range}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>{t('filter.verification')}</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('filter.only_face')}</Text>
          <Switch value={onlyFaceCertified} onValueChange={setFaceFilter} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('filter.only_aoecs')}</Text>
          <Switch value={onlyAoecsCertified} onValueChange={setAoecsFilter} />
        </View>

        <Text style={styles.sectionTitle}>{t('search.sort_by')}</Text>
        <View style={styles.chipsWrap}>
          {SORT_OPTIONS.map((option) => {
            const active = sortBy === option.code;
            const labelKey = SORT_LABEL_KEYS[option.code];
            return (
              <Pressable
                key={option.code}
                onPress={() => setSortBy(option.code)}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    active ? styles.chipLabelActive : styles.chipLabelInactive,
                  ]}
                >
                  {t(labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.applyButton} onPress={() => sheetRef.current?.close()}>
          <Text style={styles.applyText}>{t('filter.apply', { count: resultCount })}</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.background,
  },
  handleIndicator: {
    backgroundColor: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  clearText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionTitle: {
    ...typography.overline,
    marginTop: spacing.sm,
    color: colors.primary,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    minHeight: spacing.xl + spacing.xs,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: colors.surface,
  },
  chipLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: colors.background,
  },
  chipLabelInactive: {
    color: colors.textPrimary,
  },
  switchRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.cardPadding,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  applyButton: {
    marginTop: spacing.screenPadding,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  applyText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.background,
  },
});

FilterBottomSheet.displayName = 'FilterBottomSheet';

export default FilterBottomSheet;

// i18n-migrated
