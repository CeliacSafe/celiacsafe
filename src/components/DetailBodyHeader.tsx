import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalized } from '../hooks/useLocalized';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { fontFamilies } from '../theme/fonts';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';

interface DetailBodyHeaderProps {
  restaurant: Restaurant;
}

function formatLocationLine(restaurant: Restaurant): string {
  const street = restaurant.address_street?.trim();
  const city = restaurant.city?.trim();
  if (street && city) {
    return `${street} · ${city}`;
  }
  return street ?? city ?? '';
}

/**
 * Oberer Inhaltsblock im Detail-Sheet: Zertifizierung, Name, Adresse, Tags.
 */
function DetailBodyHeader({ restaurant }: DetailBodyHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { cuisineName } = useLocalized();

  const showFace = restaurant.face_program === true;
  const showAoecs = restaurant.aoecs_certified === true;
  const certParts: string[] = [];
  if (showFace) certParts.push('FACE');
  if (showAoecs) certParts.push('AOECS');
  certParts.push(t('card.badge_sin_gluten'));

  const locationLine = formatLocationLine(restaurant);
  const cuisines = restaurant.cuisine_types ?? [];
  const tags = [
    ...cuisines.map((code) => cuisineName(code)),
    ...(restaurant.price_range ? [restaurant.price_range] : []),
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.certRow}>
        <MaterialCommunityIcons name="check-bold" size={14} color={colors.primary} />
        <Text style={styles.certText}>{certParts.join(' · ')}</Text>
      </View>

      <Text style={styles.name}>{restaurant.name}</Text>

      {locationLine ? (
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.locationText}>{locationLine}</Text>
        </View>
      ) : null}

      {tags.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsRow}
        >
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagLabel}>{tag}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: spacing.screenPadding,
      paddingBottom: spacing.sm,
    },
    certRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm + spacing.xs,
    },
    certText: {
      ...typography.overline,
      color: colors.primary,
      letterSpacing: 1.6,
    },
    name: {
      fontFamily: fontFamilies.serifRegular,
      fontSize: 32,
      lineHeight: 34,
      letterSpacing: -0.8,
      color: colors.textPrimary,
      marginBottom: spacing.sm + spacing.xs,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    locationText: {
      ...typography.bodySmall,
      flex: 1,
      color: colors.textSecondary,
    },
    tagsRow: {
      flexDirection: 'row',
      gap: spacing.xs + 2,
      paddingBottom: spacing.lg,
    },
    tag: {
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs + 1,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
    },
    tagLabel: {
      ...typography.caption,
      fontWeight: '500',
      color: colors.textSecondary,
    },
  });

export default DetailBodyHeader;
