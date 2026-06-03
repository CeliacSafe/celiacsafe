import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PRIMARY_VENUE_TYPES } from '../data/filterOptions';
import { useAppLanguage } from '../i18n/useAppLanguage';
import { VENUE_TYPE_NAMES } from '../i18n/lookups';
import { useFilterStore } from '../store/filterStore';
import { colors } from '../theme/colors';
import { RADIUS_PILL } from '../theme/radii';
import { SPACE_LG, SPACE_MD, SPACE_SM, SPACE_XL, SPACE_XS } from '../theme/spacing';

interface FilterPillsProps {
  onMoreFiltersPress?: () => void;
}

function FilterPills({ onMoreFiltersPress }: FilterPillsProps) {
  const { t } = useTranslation();
  const language = useAppLanguage();
  const selectedVenueTypes = useFilterStore((state) => state.selectedVenueTypes);
  const selectedRegions = useFilterStore((state) => state.selectedRegions);
  const selectedPriceRanges = useFilterStore((state) => state.selectedPriceRanges);
  const onlyFaceCertified = useFilterStore((state) => state.onlyFaceCertified);
  const onlyAoecsCertified = useFilterStore((state) => state.onlyAoecsCertified);
  const toggleVenueType = useFilterStore((state) => state.toggleVenueType);

  const isAllActive = selectedVenueTypes.length === 0;
  const activeAdvancedFilters =
    (selectedRegions?.length ?? 0) +
    (selectedPriceRanges?.length ?? 0) +
    (onlyFaceCertified ? 1 : 0) +
    (onlyAoecsCertified ? 1 : 0);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Pressable
        android_ripple={{ color: colors.rippleLight, borderless: false }}
        onPress={() => useFilterStore.setState({ selectedVenueTypes: [] })}
        style={({ pressed }) => [
          styles.pill,
          isAllActive ? styles.pillActive : styles.pillInactive,
          pressed && isAllActive && styles.pillPressedScale,
        ]}
      >
        <Text style={[styles.label, isAllActive ? styles.labelActive : styles.labelInactive]}>
          {t('filter.all')}
        </Text>
      </Pressable>

      {PRIMARY_VENUE_TYPES.map((item) => {
        const active = selectedVenueTypes.includes(item.code);
        return (
          <Pressable
            key={item.code}
            android_ripple={{ color: colors.rippleLight, borderless: false }}
            onPress={() => toggleVenueType(item.code)}
            style={({ pressed }) => [
              styles.pill,
              active ? styles.pillActive : styles.pillInactive,
              pressed && active && styles.pillPressedScale,
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={16}
              color={active ? colors.background : colors.textPrimary}
            />
            <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
              {VENUE_TYPE_NAMES[item.code][language]}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        android_ripple={{ color: colors.rippleLight, borderless: false }}
        onPress={onMoreFiltersPress}
        style={({ pressed }) => [
          styles.pill,
          activeAdvancedFilters > 0 ? styles.pillActive : styles.pillInactive,
          pressed && activeAdvancedFilters > 0 && styles.pillPressedScale,
        ]}
      >
        <MaterialCommunityIcons
          name="tune"
          size={16}
          color={activeAdvancedFilters > 0 ? colors.background : colors.textPrimary}
        />
        <Text
          style={[
            styles.label,
            activeAdvancedFilters > 0 ? styles.labelActive : styles.labelInactive,
          ]}
        >
          {t('filter.more_filters')}
        </Text>
        {activeAdvancedFilters > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{activeAdvancedFilters}</Text>
          </View>
        ) : null}
      </Pressable>
      <View style={styles.trailingSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACE_MD,
    paddingHorizontal: SPACE_XL,
    gap: SPACE_SM,
    alignItems: 'center',
  },
  pill: {
    height: 36,
    borderRadius: RADIUS_PILL,
    paddingHorizontal: SPACE_LG,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_SM - 2,
    overflow: 'hidden',
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillInactive: {
    backgroundColor: colors.surface,
  },
  pillPressedScale: {
    transform: [{ scale: 0.95 }],
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.background,
  },
  labelInactive: {
    color: colors.textPrimary,
  },
  trailingSpacing: {
    width: SPACE_XS,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: RADIUS_PILL,
    paddingHorizontal: SPACE_XS,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default FilterPills;

// i18n-migrated
