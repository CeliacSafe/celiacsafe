import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import EmptyState from '../components/EmptyState';
import FilterBottomSheet, { type FilterBottomSheetRef } from '../components/FilterBottomSheet';
import FilterPills from '../components/FilterPills';
import RestaurantCard from '../components/RestaurantCard';
import SearchBar from '../components/SearchBar';
import SkeletonCard from '../components/SkeletonCard';
import { useRestaurants } from '../hooks/useRestaurants';
import type { BuscarStackParamList } from '../navigation/BuscarStack';
import { useFilterStore } from '../store/filterStore';
import type { Restaurant } from '../types/Restaurant';
import { colors } from '../theme/colors';
import { SPACE_LG, SPACE_MD, SPACE_SM, SPACE_XL, SPACE_XS, SPACE_XXL } from '../theme/spacing';
import { formatResultCount } from '../utils/pluralize';
import { applyFilters } from '../utils/searchAndFilter';

type BuscarNavigationProp = NativeStackNavigationProp<BuscarStackParamList, 'BuscarList'>;
type BuscarScreenProps = NativeStackScreenProps<BuscarStackParamList, 'BuscarList'>;
const ITEM_HEIGHT = 320;

export function BuscarScreen(_screenProps: BuscarScreenProps) {
  const filterSheetRef = useRef<FilterBottomSheetRef>(null);
  const navigation = useNavigation<BuscarNavigationProp>();
  const { restaurants, loading, error, refetch } = useRestaurants();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const selectedVenueTypes = useFilterStore((state) => state.selectedVenueTypes);
  const selectedRegions = useFilterStore((state) => state.selectedRegions);
  const selectedPriceRanges = useFilterStore((state) => state.selectedPriceRanges);
  const onlyFaceCertified = useFilterStore((state) => state.onlyFaceCertified);
  const onlyAoecsCertified = useFilterStore((state) => state.onlyAoecsCertified);
  const sortBy = useFilterStore((state) => state.sortBy);
  const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters);
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const [refreshing, setRefreshing] = useState(false);
  const lang = 'es';

  const emptyStateTexts = {
    es: {
      filteredTitle: 'Sin resultados',
      filteredDescription: 'Prueba a quitar algunos filtros',
      clearAction: 'Limpiar filtros',
      defaultTitle: 'Aun no hay restaurantes',
    },
    en: {
      filteredTitle: 'No results',
      filteredDescription: 'Try removing some filters',
      clearAction: 'Clear filters',
      defaultTitle: 'No restaurants yet',
    },
    de: {
      filteredTitle: 'Keine Ergebnisse',
      filteredDescription: 'Versuche, einige Filter zu entfernen',
      clearAction: 'Filter zuruecksetzen',
      defaultTitle: 'Noch keine Restaurants',
    },
  } as const;

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

  const filteredRestaurants = useMemo(
    () => applyFilters(restaurants, searchQuery, filterCriteria, sortBy),
    [restaurants, searchQuery, filterCriteria, sortBy]
  );

  // Navigation zum Detail-Screen pro Restaurant.
  const openDetail = useCallback(
    (restaurantId: string) => {
      navigation.navigate('RestaurantDetail', { restaurantId });
    },
    [navigation]
  );

  // Pull-to-Refresh triggert ein erneutes Laden aus dem Daten-Hook.
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

  // Sticky Kopfbereich mit Branding, Suche und Ergebniszaehler.
  const listHeader = useMemo(
    () => (
      <View style={styles.stickyHeader}>
        <View style={styles.header}>
          <Text style={styles.title}>Celiac Safe</Text>
          <Text style={styles.subtitle}>Guia esencial sin gluten</Text>
        </View>

        <SearchBar placeholder="Buscar restaurantes, cafés o lugares..." />
        <FilterPills language={lang} onMoreFiltersPress={() => filterSheetRef.current?.expand()} />

        <View style={styles.counterRow}>
          <MaterialCommunityIcons name="star-four-points" size={14} color={colors.primary} />
          <Text style={styles.counterText}>
            {formatResultCount(filteredRestaurants.length, lang).toUpperCase()}
          </Text>
        </View>
      </View>
    ),
    [filteredRestaurants.length, lang]
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {loading ? (
        // Ladephase: kurz 5 Skeleton-Karten anzeigen.
        <FlatList
          data={Array(5).fill(null)}
          ListHeaderComponent={listHeader}
          stickyHeaderIndices={[0]}
          keyExtractor={(_item, index) => `skeleton-${index}`}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <FlatList
          data={filteredRestaurants}
          ListHeaderComponent={listHeader}
          stickyHeaderIndices={[0]}
          ListEmptyComponent={
            hasActiveFilters() ? (
              <EmptyState
                iconName="filter-off-outline"
                title={emptyStateTexts[lang].filteredTitle}
                description={emptyStateTexts[lang].filteredDescription}
                actionLabel={emptyStateTexts[lang].clearAction}
                onAction={resetFilters}
              />
            ) : (
              <EmptyState
                iconName="food-off"
                title={emptyStateTexts[lang].defaultTitle}
                description={error ?? undefined}
              />
            )
          }
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
      <FilterBottomSheet ref={filterSheetRef} language={lang} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stickyHeader: {
    backgroundColor: colors.background,
    paddingTop: SPACE_SM,
    paddingBottom: SPACE_MD,
  },
  header: {
    paddingHorizontal: SPACE_XL,
    paddingVertical: SPACE_LG,
  },
  title: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: SPACE_XS,
    color: colors.textSecondary,
    fontSize: 14,
  },
  counterRow: {
    marginTop: SPACE_MD,
    marginHorizontal: SPACE_XL,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_SM - 2,
  },
  counterText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  listContent: {
    paddingHorizontal: SPACE_XL,
    paddingBottom: SPACE_XXL,
  },
});
