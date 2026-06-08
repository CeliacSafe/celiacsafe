import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import EmptyState from '../components/EmptyState';
import SwipeableRestaurantCard from '../components/SwipeableRestaurantCard';
import { useRestaurants } from '../hooks/useRestaurants';
import type { FavoritosStackParamList } from '../navigation/FavoritosStack';
import { useFavoritesStore } from '../store/favoritesStore';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';

type FavoritosNavigationProp = NativeStackNavigationProp<FavoritosStackParamList, 'FavoritosList'>;

export function FavoritosScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<FavoritosNavigationProp>();
  const styles = useThemedStyles(createStyles);
  const { restaurants, loading } = useRestaurants();
  const favorites = useFavoritesStore((state) => state.favorites);

  const favoriteRestaurants = useMemo(() => {
    const ids = Object.entries(favorites)
      .sort(([, left], [, right]) => right.localeCompare(left))
      .map(([id]) => id);

    return ids
      .map((id) => restaurants.find((restaurant) => restaurant.id === id))
      .filter((restaurant): restaurant is Restaurant => restaurant !== undefined);
  }, [favorites, restaurants]);

  const openDetail = useCallback(
    (restaurantId: string) => {
      navigation.navigate('RestaurantDetail', { restaurantId });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Restaurant }) => (
      <SwipeableRestaurantCard restaurant={item} onPress={() => openDetail(item.id)} />
    ),
    [openDetail]
  );

  if (!loading && favoriteRestaurants.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('favorites.title')}</Text>
        </View>
        <EmptyState
          illustration="favorites"
          iconName="heart-outline"
          title={t('favorites.empty_title')}
          description={t('favorites.empty_description')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={favoriteRestaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{t('favorites.title')}</Text>
            <Text style={styles.subtitle}>
              {t('favorites.count', { count: favoriteRestaurants.length })}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.cardPadding,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.screenPadding,
  },
});

// i18n-migrated
