import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { hapticLight } from '../utils/haptics';

export interface SearchQuickDropdownOption {
  value: string | null;
  label: string;
}

interface SearchQuickDropdownProps {
  accessibilityLabel: string;
  displayValue: string;
  value: string | null;
  options: SearchQuickDropdownOption[];
  onChange: (value: string | null) => void;
  active?: boolean;
}

function SearchQuickDropdown({
  accessibilityLabel,
  displayValue,
  value,
  options,
  onChange,
  active = false,
}: SearchQuickDropdownProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => {
          hapticLight();
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.button,
          active && styles.buttonActive,
          pressed && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
          {displayValue}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const selected = value === option.value;
                return (
                  <Pressable
                    key={option.value ?? '__all__'}
                    onPress={() => {
                      hapticLight();
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={[styles.option, selected && styles.optionSelected]}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {option.label}
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
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
      minHeight: 36,
      minWidth: 0,
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
      flex: 1,
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
      paddingVertical: spacing.sm,
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

export default SearchQuickDropdown;
