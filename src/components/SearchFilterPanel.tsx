import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import FilterChipRow from './FilterChipRow';
import FilterSelect from './FilterSelect';
import { PRICE_RANGES, RATING_CHIPS, SEARCH_REGIONS } from '../data/filterOptions';
import { useAppLanguage } from '../i18n/useAppLanguage';
import { REGION_NAMES } from '../i18n/regions';
import { VENUE_TYPE_NAMES } from '../i18n/lookups';
import { useRestaurants } from '../hooks/useRestaurants';
import { useFilterStore } from '../store/filterStore';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { hapticLight } from '../utils/haptics';

interface SearchFilterPanelProps {
  onClose: () => void;
}

function SearchFilterPanel({ onClose }: SearchFilterPanelProps) {
  const { t } = useTranslation();
  const language = useAppLanguage();
  const { restaurants } = useRestaurants();

  const selectedRegions = useFilterStore((s) => s.selectedRegions);
  const selectedCity = useFilterStore((s) => s.selectedCity);
  const selectedVenueTypes = useFilterStore((s) => s.selectedVenueTypes);
  const selectedPriceRanges = useFilterStore((s) => s.selectedPriceRanges);
  const minRating = useFilterStore((s) => s.minRating);
  const dietVegan = useFilterStore((s) => s.dietVegan);
  const dietVegetarian = useFilterStore((s) => s.dietVegetarian);

  const setRegionSingle = useFilterStore((s) => s.setRegionSingle);
  const setSelectedCity = useFilterStore((s) => s.setSelectedCity);
  const setVenueTypeSingle = useFilterStore((s) => s.setVenueTypeSingle);
  const setPriceRangesAll = useFilterStore((s) => s.setPriceRangesAll);
  const togglePriceRange = useFilterStore((s) => s.togglePriceRange);
  const setMinRating = useFilterStore((s) => s.setMinRating);
  const setDietVegan = useFilterStore((s) => s.setDietVegan);
  const setDietVegetarian = useFilterStore((s) => s.setDietVegetarian);

  const regionCode = selectedRegions[0] ?? null;

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    for (const r of restaurants) {
      if (regionCode && r.region_code !== regionCode) continue;
      if (r.city) cities.add(r.city);
    }
    return [...cities].sort((a, b) => a.localeCompare(b, 'es'));
  }, [restaurants, regionCode]);

  const regionOptions = useMemo(
    () => [
      { value: null, label: t('filter.all_regions') },
      ...SEARCH_REGIONS.map((code) => ({
        value: code,
        label: REGION_NAMES[code][language],
      })),
    ],
    [language, t]
  );

  const citySelectOptions = useMemo(
    () => [
      { value: null, label: t('filter.all_cities') },
      ...cityOptions.map((city) => ({ value: city, label: city })),
    ],
    [cityOptions, t]
  );

  const venueOptions = useMemo(
    () => [
      { value: null, label: t('filter.all') },
      ...Object.entries(VENUE_TYPE_NAMES).map(([code, names]) => ({
        value: code,
        label: names[language],
      })),
    ],
    [language, t]
  );

  const ratingOptions = RATING_CHIPS.map((id) => ({
    id,
    label: id === 'all' ? t('filter.all') : `${id}+`,
  }));

  const priceChipId =
    selectedPriceRanges.length === 0 ? 'all' : selectedPriceRanges[0] ?? 'all';

  const priceOptions = [
    { id: 'all', label: t('filter.all') },
    ...PRICE_RANGES.map((p) => ({ id: p, label: p })),
  ];

  const regionLabel = regionCode
    ? REGION_NAMES[regionCode as keyof typeof REGION_NAMES][language]
    : t('filter.all_regions');

  const venueCode = selectedVenueTypes[0] ?? null;
  const venueLabel = venueCode
    ? VENUE_TYPE_NAMES[venueCode as keyof typeof VENUE_TYPE_NAMES]?.[language] ?? venueCode
    : t('filter.all');

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
          label={t('filter.region')}
          value={regionCode}
          displayValue={regionLabel}
          options={regionOptions}
          onChange={setRegionSingle}
          active={regionCode != null}
        />
        <FilterSelect
          flex
          label={t('filter.city')}
          value={selectedCity}
          displayValue={selectedCity ?? t('filter.all_cities')}
          options={citySelectOptions}
          onChange={setSelectedCity}
          active={selectedCity != null}
        />
      </View>

      <View style={styles.fullWidthField}>
        <FilterSelect
          label={t('filter.venue_type')}
          value={venueCode}
          displayValue={venueLabel}
          options={venueOptions}
          onChange={setVenueTypeSingle}
          active={venueCode != null}
        />
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('filter.rating')}</Text>
          <Text style={styles.sectionHint} numberOfLines={1}>
            {t('filter.verified_hint')}
          </Text>
        </View>
        <FilterChipRow
          options={ratingOptions}
          selectedId={minRating}
          onSelect={(id) => setMinRating(id as (typeof RATING_CHIPS)[number])}
        />
      </View>

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

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>{t('filter.dietary')}</Text>
        <View style={styles.dietRow}>
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
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  panelScroll: {
    maxHeight: 340,
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
