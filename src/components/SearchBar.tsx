import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useFilterStore } from '../store/filterStore';
import { colors } from '../theme/colors';
import { RADIUS_INPUT } from '../theme/radii';
import { SPACE_MD, SPACE_SM } from '../theme/spacing';

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
    height: 48,
    borderRadius: RADIUS_INPUT,
    backgroundColor: colors.surface,
    paddingHorizontal: SPACE_MD + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_SM,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchBar;

// i18n-migrated
