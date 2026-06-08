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
  filtersOpen?: boolean;
  onToggleFilters?: () => void;
  /** Nur Suchfeld (ohne Filter-Button) */
  searchOnly?: boolean;
  /** In sticky Leiste: flex 1, ohne Außen-Padding */
  embedded?: boolean;
}

function SearchBarRow({
  filtersOpen = false,
  onToggleFilters,
  searchOnly = false,
  embedded = false,
}: SearchBarRowProps) {
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
    <View style={[styles.row, embedded && styles.rowEmbedded, searchOnly && styles.rowSearchOnly]}>
      <View style={[styles.inputWrap, (searchOnly || embedded) && styles.inputWrapFlex]}>
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
      {!searchOnly && onToggleFilters ? (
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
      ) : null}
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
  rowSearchOnly: {
    flex: 1,
    paddingHorizontal: 0,
  },
  rowEmbedded: {
    flex: 1,
    paddingHorizontal: 0,
  },
  inputWrap: {
    flex: 1,
    height: spacing.xxl,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputWrapFlex: {
    flex: 1,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
  },
  filterButton: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.accent,
  },
});

export default SearchBarRow;
