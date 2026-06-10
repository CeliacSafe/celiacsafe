import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';
import { hapticLight } from '../utils/haptics';
import { resolveGoogleMapsPlaceUrl } from '../utils/mapsPlaceLinks';
import { openPhone, openUrl } from '../utils/openExternalUrl';

interface DetailPrimaryActionsProps {
  restaurant: Restaurant;
}

function DetailPrimaryActions({ restaurant }: DetailPrimaryActionsProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const phone = restaurant.phone?.trim();
  const mapsUrl = resolveGoogleMapsPlaceUrl(restaurant);

  if (!phone && !mapsUrl) {
    return null;
  }

  const handleCall = () => {
    if (!phone) return;
    hapticLight();
    openPhone(phone);
  };

  const handleRoute = () => {
    if (!mapsUrl) return;
    hapticLight();
    openUrl(mapsUrl).catch(() => undefined);
  };

  return (
    <View style={styles.row}>
      {phone ? (
        <Pressable
          onPress={handleCall}
          accessibilityRole="button"
          accessibilityLabel={t('detail.call')}
          android_ripple={{ color: colors.rippleLight }}
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            !mapsUrl && styles.buttonFull,
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons name="phone" size={20} color={colors.onPrimary} />
          <Text style={styles.primaryLabel}>{t('detail.call')}</Text>
        </Pressable>
      ) : null}
      {mapsUrl ? (
        <Pressable
          onPress={handleRoute}
          accessibilityRole="button"
          accessibilityLabel={t('detail.route')}
          android_ripple={{ color: colors.rippleLight }}
          style={({ pressed }) => [
            styles.button,
            styles.secondaryButton,
            !phone && styles.buttonFull,
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons name="directions" size={20} color={colors.primary} />
          <Text style={styles.secondaryLabel}>{t('detail.route')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.screenPadding,
      paddingBottom: spacing.lg,
    },
    button: {
      flex: 1,
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      overflow: 'hidden',
      ...Platform.select({
        web: { cursor: 'pointer' as const },
        default: {},
      }),
    },
    buttonFull: {
      flex: 1,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    primaryLabel: {
      ...typography.button,
      color: colors.onPrimary,
    },
    secondaryLabel: {
      ...typography.button,
      color: colors.primary,
    },
    pressed: {
      opacity: 0.9,
    },
  });

export default DetailPrimaryActions;
