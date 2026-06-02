import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppLanguage } from '../i18n/getLocalizedName';
import { colors } from '../theme/colors';
import { SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

interface DescriptionBlockProps {
  restaurant: Restaurant;
  language?: AppLanguage;
}

const SECTION_TITLES: Record<AppLanguage, string> = {
  es: 'Sobre el restaurante',
  en: 'About',
  de: 'Über das Restaurant',
};

const READ_MORE: Record<AppLanguage, string> = {
  es: 'Leer más',
  en: 'Read more',
  de: 'Mehr lesen',
};

const READ_LESS: Record<AppLanguage, string> = {
  es: 'Leer menos',
  en: 'Read less',
  de: 'Weniger',
};

const COLLAPSED_LENGTH = 150;

function pickDescription(restaurant: Restaurant, language: AppLanguage): string | null {
  const byLanguage = {
    de: restaurant.description_de,
    en: restaurant.description_en,
    es: restaurant.description_es,
  } as const;

  const primary = byLanguage[language]?.trim();
  if (primary) {
    return primary;
  }

  const fallback = restaurant.description_es?.trim();
  return fallback || null;
}

/**
 * Beschreibungstext in der aktuellen App-Sprache mit optionalem Ausklappen.
 */
function DescriptionBlock({ restaurant, language = 'es' }: DescriptionBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const description = useMemo(() => pickDescription(restaurant, language), [restaurant, language]);

  if (!description) {
    return null;
  }

  const isLong = description.length > COLLAPSED_LENGTH;
  const displayText =
    isLong && !expanded ? `${description.slice(0, COLLAPSED_LENGTH).trim()}…` : description;

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="text-box-outline" size={18} color={colors.primary} />
        <Text style={styles.title}>{SECTION_TITLES[language]}</Text>
      </View>
      <Text style={styles.body}>{displayText}</Text>
      {isLong ? (
        <Pressable onPress={() => setExpanded((value) => !value)} hitSlop={8}>
          <Text style={styles.toggle}>{expanded ? READ_LESS[language] : READ_MORE[language]}</Text>
        </Pressable>
      ) : null}
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
  body: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22.5,
  },
  toggle: {
    marginTop: SPACE_SM,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DescriptionBlock;
