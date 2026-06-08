import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { hapticLight } from '../utils/haptics';

interface ChipOption {
  id: string;
  label: string;
}

interface FilterChipRowProps {
  options: ChipOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function FilterChipRow({ options, selectedId, onSelect }: FilterChipRowProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((option) => {
        const active = selectedId === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => {
              hapticLight();
              onSelect(option.id);
            }}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
          >
            <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
      <View style={styles.trailing} />
    </ScrollView>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primaryDark,
  },
  chipInactive: {
    backgroundColor: colors.surface,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.onPrimary,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
  trailing: {
    width: spacing.xs,
  },
});

export default FilterChipRow;
