import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalized } from '../hooks/useLocalized';
import { colors } from '../theme/colors';
import { SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

interface DescriptionBlockProps {
  restaurant: Restaurant;
}

const COLLAPSED_LENGTH = 150;

function DescriptionBlock({ restaurant }: DescriptionBlockProps) {
  const { t } = useTranslation();
  const { description } = useLocalized();
  const [expanded, setExpanded] = useState(false);
  const descriptionText = useMemo(() => description(restaurant), [description, restaurant]);

  if (!descriptionText) {
    return null;
  }

  const isLong = descriptionText.length > COLLAPSED_LENGTH;
  const displayText =
    isLong && !expanded
      ? `${descriptionText.slice(0, COLLAPSED_LENGTH).trim()}…`
      : descriptionText;

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="text-box-outline" size={18} color={colors.primary} />
        <Text style={styles.title}>{t('detail.about')}</Text>
      </View>
      <Text style={styles.body}>{displayText}</Text>
      {isLong ? (
        <Pressable onPress={() => setExpanded((value) => !value)} hitSlop={8}>
          <Text style={styles.toggle}>
            {expanded ? t('detail.read_less') : t('detail.read_more')}
          </Text>
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

// i18n-migrated
