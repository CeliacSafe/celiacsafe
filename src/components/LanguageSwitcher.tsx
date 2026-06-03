import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLanguageStore } from '../store/languageStore';
import { colors } from '../theme/colors';
import type { SupportedLanguage } from '../i18n';
import { SPACE_MD, SPACE_XL } from '../theme/spacing';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full';
}

const LANGUAGE_OPTIONS: { code: SupportedLanguage; flag: string; label: string }[] = [
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
];

function LanguageSwitcher({ variant = 'full' }: LanguageSwitcherProps) {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const handleSelect = (code: SupportedLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
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
            style={[
              styles.fullRow,
              index < LANGUAGE_OPTIONS.length - 1 && styles.fullRowBorder,
            ]}
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

const styles = StyleSheet.create({
  compactRow: {
    flexDirection: 'row',
    gap: SPACE_MD,
  },
  compactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  fullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACE_XL,
    gap: SPACE_MD,
  },
  fullRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  fullLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  checkSpacer: {
    width: 22,
  },
});

export default LanguageSwitcher;
