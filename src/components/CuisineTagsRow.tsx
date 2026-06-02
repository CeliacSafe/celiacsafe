import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import BadgePill from './BadgePill';
import { CUISINE_TYPE_NAMES, formatCuisineFallback } from '../i18n/lookups';
import type { AppLanguage } from '../i18n/getLocalizedName';
import { colors } from '../theme/colors';
import { SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

interface CuisineTagsRowProps {
  restaurant: Restaurant;
  language?: AppLanguage;
}

const SECTION_TITLES: Record<AppLanguage, string> = {
  es: 'Cocina',
  en: 'Cuisine',
  de: 'Küche',
};

function getCuisineLabel(code: string, language: AppLanguage): string {
  const entry = CUISINE_TYPE_NAMES[code];
  if (entry) {
    return entry[language] ?? entry.es;
  }
  return formatCuisineFallback(code);
}

/**
 * Horizontale Cuisine-Tags als BadgePill-Reihe.
 */
function CuisineTagsRow({ restaurant, language = 'es' }: CuisineTagsRowProps) {
  const cuisines = restaurant.cuisine_types ?? [];

  if (cuisines.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={colors.primary} />
        <Text style={styles.title}>{SECTION_TITLES[language]}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cuisines.map((code) => (
          <BadgePill key={code} label={getCuisineLabel(code, language)} variant="cuisine" />
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
