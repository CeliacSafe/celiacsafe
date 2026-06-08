import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalized } from '../hooks/useLocalized';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';

interface DescriptionBlockProps {
  restaurant: Restaurant;
}

const COLLAPSED_LENGTH = 150;

function DescriptionBlock({ restaurant }: DescriptionBlockProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { description } = useLocalized();
  const [expanded, setExpanded] = useState(false);
  const descriptionText = useMemo(() => description(restaurant), [description, restaurant]);

  if (!descriptionText) {
    return null;
  }

  const isLong = descriptionText.length > COLLAPSED_LENGTH;
  const displayText =
    isLong && !expanded ? `${descriptionText.slice(0, COLLAPSED_LENGTH).trim()}…` : descriptionText;

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

const createStyles = (colors: AppColors) => StyleSheet.create({
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
  body: {
    ...typography.body,
    color: colors.textPrimary,
  },
  toggle: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default DescriptionBlock;

// i18n-migrated
