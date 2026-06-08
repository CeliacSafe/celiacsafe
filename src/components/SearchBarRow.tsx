import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useFilterStore } from '../store/filterStore';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { hapticLight } from '../utils/haptics';

interface SearchBarRowProps {
  filtersOpen: boolean;
  onToggleFilters: () => void;
}

function SearchBarRow({ filtersOpen, onToggleFilters }: SearchBarRowProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);

  const handleClear = () => {
    setSearchQuery('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.row}>
      <View style={styles.inputWrap}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          style={styles.input}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={handleClear} hitSlop={8}>
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={() => {
          hapticLight();
          onToggleFilters();
        }}
        style={[styles.filterButton, filtersOpen && styles.filterButtonActive]}
        accessibilityRole="button"
        accessibilityLabel={t('filter.title')}
      >
        <MaterialCommunityIcons
          name={filtersOpen ? 'tune-vertical' : 'filter-variant'}
          size={22}
          color={colors.onPrimary}
        />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenPadding,
  },
  inputWrap: {
    flex: 1,
    height: spacing.xxl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
  },
  filterButton: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.verifiedGreen,
  },
});

export default SearchBarRow;
