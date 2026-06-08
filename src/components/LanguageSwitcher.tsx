import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLanguageStore } from '../store/languageStore';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

import type { SupportedLanguage } from '../i18n';
import { typography } from '../theme/typography';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full';
}

const LANGUAGE_OPTIONS: { code: SupportedLanguage; flag: string; label: string }[] = [
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
];

function LanguageSwitcher({ variant = 'full' }: LanguageSwitcherProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  if (variant === 'compact') {
    return (
      <View style={styles.compactRow}>
        {LANGUAGE_OPTIONS.map((option) => {
          const active = language === option.code;
          return (
            <Pressable
              key={option.code}
              onPress={() => handleSelect(option.code)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              style={[styles.compactButton, active && styles.compactButtonActive]}
            >
              <Text style={styles.flag}>{option.flag}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.fullList}>
      {LANGUAGE_OPTIONS.map((option, index) => {
        const active = language === option.code;
        return (
          <Pressable
            key={option.code}
            onPress={() => handleSelect(option.code)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            style={[styles.fullRow, index < LANGUAGE_OPTIONS.length - 1 && styles.fullRowBorder]}
          >
            <Text style={styles.flag}>{option.flag}</Text>
            <Text style={styles.fullLabel}>{option.label}</Text>
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

const createStyles = (colors: AppColors) => StyleSheet.create({
  compactRow: {
    flexDirection: 'row',
    gap: spacing.cardPadding,
  },
  compactButton: {
    width: 40,
    height: 40,
    borderRadius: radius.icon,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  compactButtonActive: {
    borderColor: colors.primary,
  },
  flag: {
    fontSize: 24,
  },
  fullList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  fullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.cardPadding,
  },
  fullRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fullLabel: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
    color: colors.textPrimary,
  },
  checkSpacer: {
    width: 22,
  },
});

export default LanguageSwitcher;
