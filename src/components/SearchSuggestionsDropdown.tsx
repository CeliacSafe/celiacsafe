import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, shadows, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { SearchSuggestion } from '../utils/searchSuggestions';

interface SearchSuggestionsDropdownProps {
  suggestions: SearchSuggestion[];
  visible: boolean;
  onSelect: (suggestion: SearchSuggestion) => void;
}

function SearchSuggestionsDropdown({
  suggestions,
  visible,
  onSelect,
}: SearchSuggestionsDropdownProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.dropdown}>
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        style={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <MaterialCommunityIcons
              name={item.kind === 'city' ? 'map-marker-outline' : 'silverware-fork-knife'}
              size={18}
              color={colors.primary}
            />
            <View style={styles.textWrap}>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
              {item.subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: spacing.xs,
      maxHeight: 240,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.lineSoft,
      overflow: 'hidden',
      zIndex: 20,
      ...shadows.medium,
    },
    list: {
      flexGrow: 0,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.lineSoft,
    },
    rowPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    textWrap: {
      flex: 1,
      minWidth: 0,
    },
    label: {
      ...typography.body,
      color: colors.textPrimary,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 1,
    },
  });

export default SearchSuggestionsDropdown;
