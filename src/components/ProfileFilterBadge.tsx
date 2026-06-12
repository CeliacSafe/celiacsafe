import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useProfileDietaryFilter } from '../hooks/useProfileDietaryFilter';
import type { DietaryPreferenceKey } from '../store/userPreferencesStore';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import { hapticLight } from '../utils/haptics';

const LABEL_KEYS: Record<DietaryPreferenceKey, string> = {
  lactoseFree: 'profile.dietary_lactose_free',
  vegan: 'profile.dietary_vegan',
  wheatFree: 'profile.dietary_wheat_free',
};

type RootTabNavigationProp = BottomTabNavigationProp<{
  Buscar: undefined;
  Comunidad: undefined;
  Mapa: undefined;
  Favoritos: undefined;
  Perfil: undefined;
}>;

function ProfileFilterBadge() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<RootTabNavigationProp>();
  const profileDietary = useProfileDietaryFilter();

  const activeLabels = useMemo(() => {
    if (!profileDietary) {
      return [];
    }
    return (Object.keys(LABEL_KEYS) as DietaryPreferenceKey[])
      .filter((key) => profileDietary[key])
      .map((key) => t(LABEL_KEYS[key]));
  }, [profileDietary, t]);

  const handlePress = useCallback(() => {
    hapticLight();
    navigation.navigate('Perfil');
  }, [navigation]);

  if (activeLabels.length === 0) {
    return null;
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('search.profile_filter_badge_a11y', {
        filters: activeLabels.join(', '),
      })}
      style={({ pressed }) => [styles.badge, pressed && styles.badgePressed]}
    >
      <MaterialCommunityIcons name="account-filter" size={16} color={colors.primary} />
      <Text style={styles.label} numberOfLines={2}>
        {t('search.profile_filter_badge', { filters: activeLabels.join(' · ') })}
      </Text>
      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.screenPadding,
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.cardPadding,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.lineSoft,
    },
    badgePressed: {
      opacity: 0.85,
    },
    label: {
      ...typography.bodySmall,
      flex: 1,
      color: colors.textPrimary,
      fontWeight: '600',
    },
  });

export default ProfileFilterBadge;
