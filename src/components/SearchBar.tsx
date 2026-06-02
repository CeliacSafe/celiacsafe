import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useFilterStore } from '../store/filterStore';
import { colors } from '../theme/colors';
import { RADIUS_INPUT } from '../theme/radii';
import { SPACE_MD, SPACE_SM } from '../theme/spacing';

interface SearchBarProps {
  placeholder?: string;
  onSearchChange?: (query: string) => void;
}

function SearchBar({ placeholder, onSearchChange }: SearchBarProps) {
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);

  const handleChangeText = (query: string) => {
    // Bei lokaler Datenmenge bewusst ohne Debounce (KISS). Bei 1000+ Items kann
    // spaeter ein useDebounce-Hook ergänzt werden.
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
        placeholder={placeholder}
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

