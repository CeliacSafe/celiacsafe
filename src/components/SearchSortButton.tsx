import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SORT_OPTIONS } from '../data/filterOptions';
import { useAppLanguage } from '../i18n/useAppLanguage';
import { useFilterStore } from '../store/filterStore';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { hapticLight } from '../utils/haptics';

function SearchSortButton() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const language = useAppLanguage();
  const sortBy = useFilterStore((s) => s.sortBy);
  const setSortBy = useFilterStore((s) => s.setSortBy);
  const [open, setOpen] = useState(false);

  const sortLabel =
    SORT_OPTIONS.find((option) => option.code === sortBy)?.labels[language] ??
    SORT_OPTIONS[0].labels[language];

  const isActive = sortBy !== 'name_asc';

  return (
    <>
      <View style={styles.wrap}>
        <Pressable
          onPress={() => {
            hapticLight();
            setOpen(true);
          }}
          style={({ pressed }) => [
            styles.button,
            isActive && styles.buttonActive,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('search.sort_by')}
        >
          <MaterialCommunityIcons
            name="sort"
            size={18}
            color={isActive ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
            {sortLabel}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>{t('search.sort_by')}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {SORT_OPTIONS.map((option) => {
                const selected = sortBy === option.code;
                return (
                  <Pressable
                    key={option.code}
                    onPress={() => {
                      hapticLight();
                      setSortBy(option.code);
                      setOpen(false);
                    }}
                    style={[styles.option, selected && styles.optionSelected]}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {option.labels[language]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    wrap: {
      paddingHorizontal: spacing.screenPadding,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      minHeight: 36,
      maxWidth: '100%',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    buttonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceAlt,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    label: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.textSecondary,
      flexShrink: 1,
    },
    labelActive: {
      color: colors.textPrimary,
    },
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlayDark,
      justifyContent: 'flex-end',
    },
    sheet: {
      maxHeight: '50%',
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    sheetTitle: {
      ...typography.overline,
      color: colors.textSecondary,
      paddingHorizontal: spacing.screenPadding,
      paddingBottom: spacing.sm,
    },
    option: {
      paddingHorizontal: spacing.screenPadding,
      paddingVertical: spacing.cardPadding,
      minHeight: 48,
      justifyContent: 'center',
    },
    optionSelected: {
      backgroundColor: colors.cuisineSurface,
    },
    optionText: {
      ...typography.body,
      color: colors.textPrimary,
    },
    optionTextSelected: {
      color: colors.primary,
      fontWeight: '600',
    },
  });

export default SearchSortButton;
