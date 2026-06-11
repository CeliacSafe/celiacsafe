import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';
import SwipeableRestaurantCard from '../components/SwipeableRestaurantCard';
import { useRestaurants } from '../hooks/useRestaurants';
import type { FavoritosStackParamList } from '../navigation/FavoritosStack';
import { useFavoritesStore } from '../store/favoritesStore';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { fontFamilies } from '../theme/fonts';
import { spacing } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

type FavoritosNavigationProp = NativeStackNavigationProp<FavoritosStackParamList, 'FavoritosList'>;
type RootTabNavigationProp = BottomTabNavigationProp<{
  Buscar: undefined;
  Comunidad: undefined;
  Mapa: undefined;
  Favoritos: undefined;
  Perfil: undefined;
}>;

const LOADING_SKELETON_COUNT = 3;

function FavoritesHeader({ count }: { count: number }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createHeaderStyles);

  return (
    <View style={styles.header}>
      <Text style={styles.count}>
        {t('favorites.header_count', { count }).toUpperCase()}
      </Text>
      <Text style={styles.title}>
        {t('favorites.title_line1')}{' '}
        <Text style={styles.titleAccent}>{t('favorites.title_accent')}</Text>
      </Text>
    </View>
  );
}

export function FavoritosScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<FavoritosNavigationProp>();
  const styles = useThemedStyles(createStyles);
  const { restaurants, loading } = useRestaurants();
  const favorites = useFavoritesStore((state) => state.favorites);

  const favoriteCount = Object.keys(favorites).length;

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

  const goToSearch = useCallback(() => {
    navigation.getParent<RootTabNavigationProp>()?.navigate('Buscar');
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: Restaurant }) => (
      <SwipeableRestaurantCard restaurant={item} onPress={() => openDetail(item.id)} />
    ),
    [openDetail]
  );

  const listHeader = useMemo(
    () => <FavoritesHeader count={favoriteCount} />,
    [favoriteCount]
  );

  if (loading && favoriteCount > 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <FavoritesHeader count={favoriteCount} />
        <View style={styles.loadingList}>
          {Array.from({ length: LOADING_SKELETON_COUNT }, (_, index) => (
            <SkeletonCard key={`favorite-skeleton-${index}`} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (!loading && favoriteRestaurants.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <FavoritesHeader count={0} />
        <EmptyState
          illustration="favorites"
          iconName="heart-outline"
          title={t('favorites.empty_title')}
          description={t('favorites.empty_description')}
          actionLabel={t('favorites.empty_discover_cta')}
          onAction={goToSearch}
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
        ListHeaderComponent={listHeader}
      />
    </SafeAreaView>
  );
}

const createHeaderStyles = (colors: AppColors) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: spacing.screenPadding,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    count: {
      fontFamily: fontFamilies.mono,
      fontSize: 10,
      letterSpacing: 1.4,
      color: colors.primary,
      marginBottom: spacing.sm + 2,
    },
    title: {
      fontFamily: fontFamilies.serifRegular,
      fontSize: 36,
      lineHeight: 38,
      letterSpacing: -0.9,
      color: colors.textPrimary,
    },
    titleAccent: {
      fontFamily: fontFamilies.serifItalic,
      color: colors.heart,
    },
  });

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: spacing.screenPadding,
      paddingBottom: spacing.xxl,
    },
    loadingList: {
      paddingHorizontal: spacing.screenPadding,
      gap: spacing.md,
    },
  });

// i18n-migrated
