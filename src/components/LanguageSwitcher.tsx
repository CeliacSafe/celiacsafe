import { Pressable, StyleSheet, View } from 'react-native';

import LanguageFlag from './LanguageFlag';
import { useLanguageStore } from '../store/languageStore';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

import type { SupportedLanguage } from '../i18n';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full' | 'header';
}

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string }[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

function LanguageSwitcher({ variant = 'full' }: LanguageSwitcherProps) {
  const styles = useThemedStyles(createStyles);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  if (variant === 'header') {
    return (
      <View style={styles.headerRow}>
        {LANGUAGE_OPTIONS.map((option) => {
          const active = language === option.code;
          return (
            <Pressable
              key={option.code}
              onPress={() => handleSelect(option.code)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: active }}
              style={[styles.headerFlagButton, active && styles.headerFlagButtonActive]}
            >
              <LanguageFlag code={option.code} size={16} />
            </Pressable>
          );
        })}
      </View>
    );
  }

  if (variant === 'compact' || variant === 'full') {
    const flagSize = variant === 'full' ? 22 : 20;
    const buttonStyle = variant === 'full' ? styles.fullButton : styles.compactButton;
    const activeStyle = variant === 'full' ? styles.fullButtonActive : styles.compactButtonActive;

    return (
      <View style={styles.flagRow}>
        {LANGUAGE_OPTIONS.map((option) => {
          const active = language === option.code;
          return (
            <Pressable
              key={option.code}
              onPress={() => handleSelect(option.code)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: active }}
              style={[buttonStyle, active && activeStyle]}
            >
              <LanguageFlag code={option.code} size={flagSize} />
            </Pressable>
          );
        })}
      </View>
    );
  }

  return null;
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    flagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    headerFlagButton: {
      width: 32,
      height: 32,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      overflow: 'hidden',
    },
    headerFlagButtonActive: {
      borderColor: colors.primary,
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
    fullButton: {
      flex: 1,
      height: 48,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    fullButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceAlt,
    },
  });

export default LanguageSwitcher;
