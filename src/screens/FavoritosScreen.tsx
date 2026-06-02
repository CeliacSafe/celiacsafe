import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import SwipeableRestaurantCard from '../components/SwipeableRestaurantCard';
import { useRestaurants } from '../hooks/useRestaurants';
import type { FavoritosStackParamList } from '../navigation/FavoritosStack';
import { useFavoritesStore } from '../store/favoritesStore';
import { colors } from '../theme/colors';
import { SPACE_LG, SPACE_MD, SPACE_XL } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

type FavoritosNavigationProp = NativeStackNavigationProp<FavoritosStackParamList, 'FavoritosList'>;

const EMPTY_TEXTS = {
  es: {
    title: 'Aún no tienes favoritos',
    description: 'Guarda restaurantes con el corazón para encontrarlos aquí.',
  },
  en: {
    title: 'No favorites yet',
    description: 'Save restaurants with the heart to find them here.',
  },
  de: {
    title: 'Noch keine Favoriten',
    description: 'Speichere Restaurants mit dem Herz, um sie hier zu finden.',
  },
} as const;

export function FavoritosScreen() {
  const navigation = useNavigation<FavoritosNavigationProp>();
  const language = 'es';
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
      <SwipeableRestaurantCard
        restaurant={item}
        onPress={() => openDetail(item.id)}
        language={language}
      />
    ),
    [language, openDetail]
  );

  const emptyCopy = EMPTY_TEXTS[language];

  if (!loading && favoriteRestaurants.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Favoritos</Text>
        </View>
        <EmptyState
          iconName="heart-outline"
          title={emptyCopy.title}
          description={emptyCopy.description}
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
            <Text style={styles.title}>Favoritos</Text>
            <Text style={styles.subtitle}>
              {favoriteRestaurants.length}{' '}
              {favoriteRestaurants.length === 1 ? 'restaurante' : 'restaurantes'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: SPACE_XL,
    paddingTop: SPACE_MD,
    paddingBottom: SPACE_LG,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: SPACE_MD - 4,
    color: colors.textSecondary,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: SPACE_XL,
    paddingBottom: SPACE_XL,
  },
});
