import { StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import RecentVerifiedFeedCard from './RecentVerifiedFeedCard';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';
import { getRecentlyVerifiedRestaurants } from '../utils/communityFeed';

interface RecentVerifiedFeedProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurantId: string) => void;
  limit?: number;
}

function RecentVerifiedFeed({
  restaurants,
  onSelectRestaurant,
  limit = 6,
}: RecentVerifiedFeedProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  const items = useMemo(
    () => getRecentlyVerifiedRestaurants(restaurants, limit),
    [restaurants, limit]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('community.recent_title')}</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>{t('community.feed_live')}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{t('community.feed_subtitle')}</Text>
      <View style={styles.list}>
        {items.map((restaurant) => (
          <RecentVerifiedFeedCard
            key={restaurant.id}
            restaurant={restaurant}
            onPress={() => onSelectRestaurant(restaurant.id)}
          />
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    section: {
      gap: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    title: {
      ...typography.h3,
      color: colors.textPrimary,
      flex: 1,
    },
    livePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: colors.surfaceAlt,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    liveLabel: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.primary,
      letterSpacing: 0.2,
    },
    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    list: {
      gap: spacing.sm,
    },
  });

export default RecentVerifiedFeed;
