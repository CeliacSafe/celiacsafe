import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BadgePill from './BadgePill';
import { useLocalized } from '../hooks/useLocalized';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';

interface CuisineTagsRowProps {
  restaurant: Restaurant;
}

/**
 * Horizontale Cuisine-Tags als BadgePill-Reihe.
 */
function CuisineTagsRow({ restaurant }: CuisineTagsRowProps) {
  const { t } = useTranslation();
  const { cuisineName } = useLocalized();
  const cuisines = restaurant.cuisine_types ?? [];

  if (cuisines.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={colors.primary} />
        <Text style={styles.title}>{t('detail.cuisine')}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cuisines.map((code) => (
          <BadgePill key={code} label={cuisineName(code)} variant="cuisine" />
        ))}
        <View style={styles.trailingSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.cardPadding,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.cardPadding,
  },
  title: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollContent: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  trailingSpacer: {
    width: spacing.sm,
  },
});

export default CuisineTagsRow;

// i18n-migrated
