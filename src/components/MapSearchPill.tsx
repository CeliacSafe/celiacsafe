import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import SearchSuggestionsDropdown from './SearchSuggestionsDropdown';
import { useSearchFieldFocus } from '../hooks/useSearchFieldFocus';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { useFilterStore } from '../store/filterStore';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, shadows, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  suggestionToSearchQuery,
  type SearchSuggestion,
} from '../utils/searchSuggestions';

interface MapSearchPillProps {
  areaLabel: string;
  pinCount: number;
  onMyLocationPress: () => void;
  locationLoading?: boolean;
}

/**
 * Schwebende Suchleiste auf der Karte — Region/Zaehler plus GPS-Shortcut.
 */
function MapSearchPill({
  areaLabel,
  pinCount,
  onMyLocationPress,
  locationLoading = false,
}: MapSearchPillProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);
  const { focused, onFocus, onBlur, dismiss } = useSearchFieldFocus();
  const suggestions = useSearchSuggestions(searchQuery);
  const showSuggestions =
    focused && searchQuery.trim().length >= 1 && suggestions.length > 0;

  const countLabel = t('map.places', { count: pinCount });
  const placeholder = `${areaLabel} · ${countLabel}`;

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestionToSearchQuery(suggestion));
    dismiss();
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, showSuggestions && styles.containerSuggestions]}>
      <MaterialCommunityIcons name="magnify" size={16} color={colors.textSecondary} />
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primary}
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={() => Keyboard.dismiss()}
      />
      <Pressable
        onPress={onMyLocationPress}
        disabled={locationLoading}
        accessibilityLabel={t('map.my_location')}
        accessibilityRole="button"
        android_ripple={{ color: colors.rippleLight, borderless: true }}
        style={({ pressed }) => [
          styles.locationButton,
          pressed && !locationLoading && styles.locationPressed,
        ]}
      >
        {locationLoading ? (
          <ActivityIndicator size="small" color={colors.onPrimary} />
        ) : (
          <MaterialCommunityIcons name="crosshairs-gps" size={14} color={colors.onPrimary} />
        )}
      </Pressable>
      <SearchSuggestionsDropdown
        suggestions={suggestions}
        visible={showSuggestions}
        onSelect={handleSelectSuggestion}
      />
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      marginHorizontal: spacing.md,
      marginTop: spacing.sm,
      height: 48,
      borderRadius: radius.pill,
      backgroundColor: colors.background,
      paddingLeft: spacing.md,
      paddingRight: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      ...shadows.medium,
    },
    containerSuggestions: {
      position: 'relative',
      zIndex: 30,
    },
    input: {
      ...typography.bodySmall,
      flex: 1,
      color: colors.textPrimary,
      paddingVertical: 0,
    },
    locationButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    locationPressed: {
      opacity: 0.85,
    },
  });

export default MapSearchPill;
