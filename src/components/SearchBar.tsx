import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useFilterStore } from '../store/filterStore';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';

interface SearchBarProps {
  onSearchChange?: (query: string) => void;
}

function SearchBar({ onSearchChange }: SearchBarProps) {
  const { t } = useTranslation();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);

  const handleChangeText = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearchChange?.('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
      <TextInput
        value={searchQuery}
        onChangeText={handleChangeText}
        placeholder={t('search.placeholder')}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primary}
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {searchQuery.length > 0 ? (
        <Pressable onPress={handleClear} hitSlop={8} style={styles.clearButton}>
          <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchBar;

// i18n-migrated
