import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import EmptyState from '../components/EmptyState';
import AppLogo from '../components/AppLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import RestaurantCard from '../components/RestaurantCard';
import SearchBarRow from '../components/SearchBarRow';
import SearchCategoryTabs from '../components/SearchCategoryTabs';
import SearchFilterPanel from '../components/SearchFilterPanel';
import SkeletonCard from '../components/SkeletonCard';
import { hapticMedium } from '../utils/haptics';
import { useRestaurants } from '../hooks/useRestaurants';
import type { BuscarStackParamList } from '../navigation/BuscarStack';
import { useFilterStore } from '../store/filterStore';
import type { Restaurant } from '../types/Restaurant';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

import { typography } from '../theme/typography';
import { formatResultCount } from '../utils/pluralize';
import { applyFilters } from '../utils/searchAndFilter';

type BuscarNavigationProp = NativeStackNavigationProp<BuscarStackParamList, 'BuscarList'>;
type BuscarScreenProps = NativeStackScreenProps<BuscarStackParamList, 'BuscarList'>;
const ITEM_HEIGHT = 320;

export function BuscarScreen(_screenProps: BuscarScreenProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<BuscarNavigationProp>();
  const { restaurants, loading, error, refetch } = useRestaurants();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const selectedVenueTypes = useFilterStore((state) => state.selectedVenueTypes);
  const selectedRegions = useFilterStore((state) => state.selectedRegions);
  const selectedPriceRanges = useFilterStore((state) => state.selectedPriceRanges);
  const onlyFaceCertified = useFilterStore((state) => state.onlyFaceCertified);
  const onlyAoecsCertified = useFilterStore((state) => state.onlyAoecsCertified);
  const selectedCity = useFilterStore((state) => state.selectedCity);
  const dietVegan = useFilterStore((state) => state.dietVegan);
  const dietVegetarian = useFilterStore((state) => state.dietVegetarian);
  const minRating = useFilterStore((state) => state.minRating);
  const categoryTab = useFilterStore((state) => state.categoryTab);
  const sortBy = useFilterStore((state) => state.sortBy);
  const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters);
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const [refreshing, setRefreshing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleClearFilters = useCallback(() => {
    hapticMedium();
    resetFilters();
  }, [resetFilters]);

  const filterCriteria = useMemo(
    () => ({
      selectedVenueTypes,
      selectedRegions,
      selectedPriceRanges,
      onlyFaceCertified,
      onlyAoecsCertified,
      selectedCity,
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
      dietVegan,
      dietVegetarian,
      minRating,
      categoryTab,
    ]
  );

  const filteredRestaurants = useMemo(
    () => applyFilters(restaurants, searchQuery, filterCriteria, sortBy),
    [restaurants, searchQuery, filterCriteria, sortBy]
  );

  const openDetail = useCallback(
    (restaurantId: string) => {
      navigation.navigate('RestaurantDetail', { restaurantId });
    },
    [navigation]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: Restaurant }) => (
      <RestaurantCard restaurant={item} onPress={() => openDetail(item.id)} />
    ),
    [openDetail]
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <AppLogo width={200} />
            <Text style={styles.subtitle}>{t('search.subtitle')}</Text>
          </View>
          <LanguageSwitcher variant="compact" />
        </View>

        <View style={styles.counterRow}>
          <MaterialCommunityIcons name="star-four-points" size={14} color={colors.primary} />
          <Text style={styles.counterText}>
            {formatResultCount(filteredRestaurants.length).toUpperCase()}
          </Text>
        </View>
      </View>
    ),
    [filteredRestaurants.length, t]
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.topChrome}>
        <SearchBarRow
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((open) => !open)}
        />
        {filtersOpen ? <SearchFilterPanel onClose={() => setFiltersOpen(false)} /> : null}
        <SearchCategoryTabs />
      </View>
      {loading ? (
        <FlatList
          style={styles.list}
          data={Array(5).fill(null)}
          ListHeaderComponent={listHeader}
          keyExtractor={(_item, index) => `skeleton-${index}`}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <FlatList
          style={styles.list}
          data={filteredRestaurants}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            hasActiveFilters() ? (
              <EmptyState
                inline
                illustration="search"
                iconName="filter-off-outline"
                title={t('search.no_results_title')}
                description={t('search.no_results_description')}
                actionLabel={t('search.clear_filters')}
                onAction={handleClearFilters}
              />
            ) : (
              <EmptyState
                inline
                illustration="default"
                iconName="food-off"
                title={t('search.no_restaurants_title')}
                description={error ?? undefined}
              />
            )
          }
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            filteredRestaurants.length === 0 && styles.listContentEmpty,
          ]}
          refreshing={refreshing}
          onRefresh={onRefresh}
          initialNumToRender={8}
          removeClippedSubviews
          windowSize={10}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          getItemLayout={(_data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topChrome: {
    zIndex: 10,
    elevation: 8,
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  list: {
    flex: 1,
  },
  listHeader: {
    backgroundColor: colors.background,
    paddingTop: spacing.sm,
    paddingBottom: spacing.cardPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  headerMain: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  counterRow: {
    marginTop: spacing.cardPadding,
    marginHorizontal: spacing.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  counterText: {
    ...typography.overline,
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.sectionGap,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
});

// i18n-migrated
