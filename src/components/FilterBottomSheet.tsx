/**
 * Bottom-Sheet fuer erweiterte Filteroptionen (Region, Preis, Verifizierung, Sortierung).
 * Die Filter wirken sofort auf die Liste; der Apply-Button schliesst das Sheet nur.
 */

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { ALL_REGIONS, PRICE_RANGES, SORT_OPTIONS } from '../data/filterOptions';
import { REGION_NAMES } from '../i18n/regions';
import { useRestaurants } from '../hooks/useRestaurants';
import { useFilterStore } from '../store/filterStore';
import { colors } from '../theme/colors';
import { RADIUS_BUTTON, RADIUS_INPUT, RADIUS_PILL } from '../theme/radii';
import { SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
import { formatResultCount } from '../utils/pluralize';
import { applyFilters } from '../utils/searchAndFilter';

interface FilterBottomSheetProps {
  language?: 'es' | 'en' | 'de';
}

export interface FilterBottomSheetRef {
  expand: () => void;
  close: () => void;
}

const texts = {
  title: { es: 'Filtros', en: 'Filters', de: 'Filter' },
  clear: { es: 'Limpiar', en: 'Clear', de: 'Zuruecksetzen' },
  region: { es: 'Region', en: 'Region', de: 'Region' },
  price: { es: 'Precio', en: 'Price', de: 'Preis' },
  verification: { es: 'Verificacion', en: 'Verification', de: 'Verifizierung' },
  onlyFace: {
    es: 'Solo FACE certificados',
    en: 'Only FACE certified',
    de: 'Nur FACE-zertifiziert',
  },
  onlyAoecs: {
    es: 'Solo AOECS certificados',
    en: 'Only AOECS certified',
    de: 'Nur AOECS-zertifiziert',
  },
  sortBy: { es: 'Ordenar por', en: 'Sort by', de: 'Sortieren nach' },
  apply: { es: 'Aplicar', en: 'Apply', de: 'Anwenden' },
} as const;

const chipLabelsByLanguage = {
  es: 'es',
  en: 'en',
  de: 'de',
} as const;

const FilterBottomSheet = forwardRef<FilterBottomSheetRef, FilterBottomSheetProps>(
  ({ language = 'es' }, ref) => {
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['85%'], []);

    const { restaurants } = useRestaurants();
    const searchQuery = useFilterStore((state) => state.searchQuery);
    const selectedVenueTypes = useFilterStore((state) => state.selectedVenueTypes);
    const selectedRegions = useFilterStore((state) => state.selectedRegions);
    const selectedPriceRanges = useFilterStore((state) => state.selectedPriceRanges);
    const onlyFaceCertified = useFilterStore((state) => state.onlyFaceCertified);
    const onlyAoecsCertified = useFilterStore((state) => state.onlyAoecsCertified);
    const sortBy = useFilterStore((state) => state.sortBy);

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
      }),
      [
        selectedVenueTypes,
        selectedRegions,
        selectedPriceRanges,
        onlyFaceCertified,
        onlyAoecsCertified,
      ]
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
            <Text style={styles.title}>{texts.title[language]}</Text>
            {hasActiveFilters() ? (
              <Pressable onPress={resetFilters}>
                <Text style={styles.clearText}>{texts.clear[language]}</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>{texts.region[language]}</Text>
          <View style={styles.chipsWrap}>
            {ALL_REGIONS.map((regionCode) => {
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
                    {REGION_NAMES[regionCode][chipLabelsByLanguage[language]]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>{texts.price[language]}</Text>
          <View style={styles.chipsWrap}>
            {PRICE_RANGES.map((range) => {
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

          <Text style={styles.sectionTitle}>{texts.verification[language]}</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{texts.onlyFace[language]}</Text>
            <Switch value={onlyFaceCertified} onValueChange={setFaceFilter} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{texts.onlyAoecs[language]}</Text>
            <Switch value={onlyAoecsCertified} onValueChange={setAoecsFilter} />
          </View>

          <Text style={styles.sectionTitle}>{texts.sortBy[language]}</Text>
          <View style={styles.chipsWrap}>
            {SORT_OPTIONS.map((option) => {
              const active = sortBy === option.code;
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
                    {option.labels[chipLabelsByLanguage[language]]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.applyButton} onPress={() => sheetRef.current?.close()}>
            <Text style={styles.applyText}>
              {texts.apply[language]} {formatResultCount(resultCount, language)}
            </Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.background,
  },
  handleIndicator: {
    backgroundColor: colors.textSecondary,
  },
  content: {
    paddingHorizontal: SPACE_XL,
    paddingBottom: SPACE_XL + SPACE_MD,
    gap: SPACE_MD - 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACE_SM,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  clearText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    marginTop: SPACE_MD - 2,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACE_SM,
  },
  chip: {
    borderRadius: RADIUS_PILL,
    minHeight: 36,
    paddingHorizontal: SPACE_MD + 2,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: colors.surface,
  },
  chipLabel: {
    fontSize: 13,
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
    borderRadius: RADIUS_INPUT,
    paddingHorizontal: SPACE_MD,
    paddingVertical: SPACE_MD - 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    flex: 1,
    marginRight: SPACE_MD - 2,
  },
  applyButton: {
    marginTop: SPACE_XL,
    borderRadius: RADIUS_BUTTON,
    backgroundColor: colors.primary,
    paddingVertical: SPACE_MD + 2,
    alignItems: 'center',
  },
  applyText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
});

FilterBottomSheet.displayName = 'FilterBottomSheet';

export default FilterBottomSheet;
