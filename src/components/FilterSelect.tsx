import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { hapticLight } from '../utils/haptics';

export interface FilterSelectOption {
  value: string | null;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string | null;
  displayValue: string;
  options: FilterSelectOption[];
  onChange: (value: string | null) => void;
  active?: boolean;
}

function FilterSelect({
  label,
  value,
  displayValue,
  options,
  onChange,
  active = false,
}: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const hasValue = value != null;

  return (
    <>
      <View style={styles.wrap}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          {active ? <View style={styles.activeDot} /> : null}
        </View>
        <View style={[styles.field, (active || hasValue) && styles.fieldActive]}>
          <Pressable
            onPress={() => {
              hapticLight();
              setOpen(true);
            }}
            style={styles.fieldMain}
          >
            <Text style={styles.value} numberOfLines={1}>
              {displayValue}
            </Text>
          </Pressable>
          {hasValue ? (
            <Pressable
              hitSlop={8}
              onPress={() => {
                hapticLight();
                onChange(null);
              }}
              style={styles.clearHit}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
          <Pressable
            hitSlop={8}
            onPress={() => {
              hapticLight();
              setOpen(true);
            }}
          >
            <MaterialCommunityIcons name="chevron-down" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
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
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 0,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.primary,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cuisineSurface,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.cardPadding,
  },
  fieldMain: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  fieldActive: {
    borderColor: colors.primaryDark,
  },
  value: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
  },
  clearHit: {
    padding: spacing.xs,
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

export default FilterSelect;
