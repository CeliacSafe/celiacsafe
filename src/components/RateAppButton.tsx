import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  PROFILE_MENU_CHEVRON_SIZE,
  PROFILE_MENU_ICON_SIZE,
  createProfileMenuStyles,
} from './profileMenuStyles';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import { requestAppStoreReview } from '../utils/rateApp';

interface RateAppButtonProps {
  variant?: 'primary' | 'plain';
}

function RateAppButton({ variant = 'plain' }: RateAppButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const profileMenuStyles = useThemedStyles(createProfileMenuStyles);
  const styles = useThemedStyles(createStyles);
  const [loading, setLoading] = useState(false);

  const handlePress = useCallback(async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      await requestAppStoreReview();
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const label = t('profile.rate_app');
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        isPrimary ? styles.primaryButton : profileMenuStyles.row,
        pressed && !loading && profileMenuStyles.rowPressed,
        loading && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? colors.onPrimary : colors.primary}
          style={isPrimary ? styles.primarySpinner : styles.plainSpinner}
        />
      ) : (
        <>
          <MaterialCommunityIcons
            name="star-outline"
            size={isPrimary ? 22 : PROFILE_MENU_ICON_SIZE}
            color={isPrimary ? colors.onPrimary : colors.primary}
          />
          <Text style={isPrimary ? styles.primaryLabel : profileMenuStyles.label}>{label}</Text>
          {isPrimary ? null : (
            <MaterialCommunityIcons
              name="chevron-right"
              size={PROFILE_MENU_CHEVRON_SIZE}
              color={colors.textSecondary}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.cardPadding,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.screenPadding,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  primaryLabel: {
    ...typography.button,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  disabled: {
    opacity: 0.6,
  },
  plainSpinner: {
    marginVertical: spacing.xs,
  },
  primarySpinner: {
    paddingVertical: spacing.xs,
  },
});

export default RateAppButton;
