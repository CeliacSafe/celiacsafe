import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import EmptyState from '../components/EmptyState';
import RestaurantCard from '../components/RestaurantCard';
import SkeletonCard from '../components/SkeletonCard';
import { useRestaurants } from '../hooks/useRestaurants';
import type { BuscarStackParamList } from '../navigation/BuscarStack';
import type { Restaurant } from '../types/Restaurant';
import { colors } from '../theme/colors';
import { formatResultCount } from '../utils/pluralize';

type BuscarNavigationProp = NativeStackNavigationProp<BuscarStackParamList, 'BuscarList'>;
type BuscarScreenProps = NativeStackScreenProps<BuscarStackParamList, 'BuscarList'>;
const ITEM_HEIGHT = 320;

export function BuscarScreen(_screenProps: BuscarScreenProps) {
  const navigation = useNavigation<BuscarNavigationProp>();
  const { restaurants, loading, error, refetch } = useRestaurants();
  const [refreshing, setRefreshing] = useState(false);

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

        <View style={styles.searchBarPlaceholder}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
          <Text style={styles.searchPlaceholderText}>Buscar restaurantes, cafes o lugares...</Text>
        </View>

        <View style={styles.counterRow}>
          <MaterialCommunityIcons name="star-four-points" size={14} color={colors.primary} />
          <Text style={styles.counterText}>
            {formatResultCount(restaurants.length).toUpperCase()}
          </Text>
        </View>
      </View>
    ),
    [restaurants.length]
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
        />
      ) : (
        <FlatList
          data={restaurants}
          ListHeaderComponent={listHeader}
          stickyHeaderIndices={[0]}
          ListEmptyComponent={
            <EmptyState
              iconName="food-off"
              title="Noch keine Restaurants gefunden"
              description={error ?? undefined}
            />
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
  stickyHeader: {
    backgroundColor: colors.background,
    paddingTop: 8,
    paddingBottom: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 14,
  },
  searchBarPlaceholder: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  counterRow: {
    marginTop: 12,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counterText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
