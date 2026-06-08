import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import LanguageFlag from './LanguageFlag';
import { useLanguageStore } from '../store/languageStore';
import { useTheme } from '../theme/ThemeContext';
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
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  const activeOption =
    LANGUAGE_OPTIONS.find((option) => option.code === language) ?? LANGUAGE_OPTIONS[0];

  if (variant === 'header') {
    const currentIndex = LANGUAGE_OPTIONS.findIndex((option) => option.code === language);
    const nextOption = LANGUAGE_OPTIONS[(currentIndex + 1) % LANGUAGE_OPTIONS.length]!;

    return (
      <Pressable
        onPress={() => handleSelect(nextOption.code)}
        accessibilityRole="button"
        accessibilityLabel={activeOption.label}
        style={styles.headerButton}
      >
        <LanguageFlag code={language} size={18} />
      </Pressable>
    );
  }

  if (variant === 'compact' || variant === 'full') {
    const flagSize = variant === 'full' ? 22 : 20;
    const buttonStyle = variant === 'full' ? styles.fullButton : styles.compactButton;
    const activeStyle = variant === 'full' ? styles.fullButtonActive : styles.compactButtonActive;

    return (
      <View style={variant === 'full' ? styles.fullRow : styles.compactRow}>
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
              {variant === 'full' && active ? (
                <MaterialCommunityIcons name="check" size={16} color={colors.primary} />
              ) : null}
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
    compactRow: {
      flexDirection: 'row',
      gap: spacing.cardPadding,
    },
    fullRow: {
      flexDirection: 'row',
      gap: spacing.md,
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
      minHeight: 52,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    fullButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceAlt,
    },
    headerButton: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
  });

export default LanguageSwitcher;
