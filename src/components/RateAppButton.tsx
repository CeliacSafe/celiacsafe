import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  PROFILE_MENU_CHEVRON_SIZE,
  PROFILE_MENU_ICON_SIZE,
  profileMenuStyles,
} from './profileMenuStyles';
import { colors } from '../theme/colors';
import { RADIUS_BUTTON } from '../theme/radii';
import { SPACE_LG, SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
import { requestAppStoreReview } from '../utils/rateApp';

interface RateAppButtonProps {
  variant?: 'primary' | 'plain';
}

function RateAppButton({ variant = 'plain' }: RateAppButtonProps) {
  const { t } = useTranslation();
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
          color={isPrimary ? colors.white : colors.primary}
          style={isPrimary ? styles.primarySpinner : styles.plainSpinner}
        />
      ) : (
        <>
          <MaterialCommunityIcons
            name="star-outline"
            size={isPrimary ? 22 : PROFILE_MENU_ICON_SIZE}
            color={isPrimary ? colors.white : colors.primary}
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

const styles = StyleSheet.create({
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACE_MD,
    backgroundColor: colors.primary,
    borderRadius: RADIUS_BUTTON,
    paddingVertical: 14,
    paddingHorizontal: SPACE_XL,
    marginHorizontal: SPACE_LG,
    marginVertical: SPACE_SM,
  },
  primaryLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
  plainSpinner: {
    marginVertical: 4,
  },
  primarySpinner: {
    paddingVertical: 4,
  },
});

export default RateAppButton;
