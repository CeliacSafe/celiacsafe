import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BadgePill from './BadgePill';
import { useLocalized } from '../hooks/useLocalized';
import { colors } from '../theme/colors';
import { SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
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
    paddingHorizontal: SPACE_XL,
    paddingVertical: SPACE_MD,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_SM,
    marginBottom: SPACE_MD,
  },
  title: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    gap: SPACE_SM,
    alignItems: 'center',
  },
  trailingSpacer: {
    width: SPACE_SM,
  },
});

export default CuisineTagsRow;

// i18n-migrated
