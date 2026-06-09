import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import SearchSuggestionsDropdown from './SearchSuggestionsDropdown';
import { useSearchFieldFocus } from '../hooks/useSearchFieldFocus';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { useFilterStore } from '../store/filterStore';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import {
  suggestionToSearchQuery,
  type SearchSuggestion,
} from '../utils/searchSuggestions';

interface SearchBarProps {
  onSearchChange?: (query: string) => void;
}

function SearchBar({ onSearchChange }: SearchBarProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);
  const { focused, onFocus, onBlur, dismiss } = useSearchFieldFocus();
  const suggestions = useSearchSuggestions(searchQuery);
  const showSuggestions =
    focused && searchQuery.trim().length >= 1 && suggestions.length > 0;

  const handleChangeText = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearchChange?.('');
    dismiss();
    Keyboard.dismiss();
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    const query = suggestionToSearchQuery(suggestion);
    setSearchQuery(query);
    onSearchChange?.(query);
    dismiss();
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, showSuggestions && styles.containerSuggestions]}>
      <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
      <TextInput
        value={searchQuery}
        onChangeText={handleChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
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
      <SearchSuggestionsDropdown
        suggestions={suggestions}
        visible={showSuggestions}
        onSelect={handleSelectSuggestion}
      />
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    height: spacing.xxl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  containerSuggestions: {
    position: 'relative',
    zIndex: 30,
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
