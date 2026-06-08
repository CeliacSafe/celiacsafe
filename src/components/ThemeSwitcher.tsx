import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { ThemePreference } from '../store/themeStore';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const OPTIONS: { value: ThemePreference; icon: IconName; labelKey: string }[] = [
  { value: 'light', icon: 'weather-sunny', labelKey: 'profile.theme_light' },
  { value: 'dark', icon: 'weather-night', labelKey: 'profile.theme_dark' },
  { value: 'system', icon: 'theme-light-dark', labelKey: 'profile.theme_system' },
];

function ThemeSwitcher() {
  const { t } = useTranslation();
  const { colors, preference, setPreference } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.list}>
      {OPTIONS.map((option, index) => {
        const active = preference === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => setPreference(option.value)}
            accessibilityRole="button"
            accessibilityLabel={t(option.labelKey)}
            accessibilityState={{ selected: active }}
            style={[styles.row, index < OPTIONS.length - 1 && styles.rowBorder]}
          >
            <MaterialCommunityIcons name={option.icon} size={22} color={colors.primary} />
            <Text style={styles.label}>{t(option.labelKey)}</Text>
            {active ? (
              <MaterialCommunityIcons name="check" size={22} color={colors.primary} />
            ) : (
              <View style={styles.checkSpacer} />
            )}
          </Pressable>
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
    checkSpacer: {
      width: 22,
    },
  });

export default ThemeSwitcher;
