import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Switch, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useUser } from '../context/UserContext';
import type { DietaryPreferenceKey } from '../store/userPreferencesStore';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const OPTIONS: { key: DietaryPreferenceKey; icon: IconName; labelKey: string }[] = [
  { key: 'lactoseFree', icon: 'cup-off', labelKey: 'profile.dietary_lactose_free' },
  { key: 'vegan', icon: 'leaf', labelKey: 'profile.dietary_vegan' },
  { key: 'wheatFree', icon: 'barley-off', labelKey: 'profile.dietary_wheat_free' },
];

function ProfileDietaryPreferences() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { dietaryPreferences, setDietaryPreference } = useUser();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.list}>
      {OPTIONS.map((option, index) => {
        const enabled = dietaryPreferences[option.key];
        return (
          <View
            key={option.key}
            style={[styles.row, index < OPTIONS.length - 1 && styles.rowBorder]}
          >
            <MaterialCommunityIcons name={option.icon} size={22} color={colors.primary} />
            <Text style={styles.label}>{t(option.labelKey)}</Text>
            <Switch
              value={enabled}
              onValueChange={(value) => setDietaryPreference(option.key, value)}
              trackColor={{ false: colors.border, true: colors.sinGlutenBg }}
              thumbColor={enabled ? colors.primary : colors.surface}
              accessibilityRole="switch"
              accessibilityLabel={t(option.labelKey)}
              accessibilityState={{ checked: enabled }}
            />
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    list: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm + spacing.xs,
      paddingHorizontal: spacing.md,
      gap: spacing.cardPadding,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    label: {
      ...typography.body,
      fontWeight: '600',
      flex: 1,
      color: colors.textPrimary,
    },
  });

export default ProfileDietaryPreferences;
