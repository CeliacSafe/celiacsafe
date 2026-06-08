import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, spacing } from '../theme/spacing';
import { hapticLight } from '../utils/haptics';

interface SearchFilterButtonProps {
  active: boolean;
  onPress: () => void;
}

function SearchFilterButton({ active, onPress }: SearchFilterButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress();
      }}
      style={[styles.button, active && styles.buttonActive]}
      accessibilityRole="button"
      accessibilityLabel={t('filter.title')}
    >
      <MaterialCommunityIcons
        name={active ? 'tune-vertical' : 'filter-variant'}
        size={22}
        color={colors.onPrimary}
      />
    </Pressable>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    button: {
      width: spacing.xxl,
      height: spacing.xxl,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonActive: {
      backgroundColor: colors.accent,
    },
  });

export default SearchFilterButton;
