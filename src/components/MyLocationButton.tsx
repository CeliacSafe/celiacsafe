import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';

interface MyLocationButtonProps {
  onPress: () => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Schwebender Button zur Zentrierung der Karte auf die Nutzerposition.
 */
function MyLocationButton({ onPress, loading = false, style }: MyLocationButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityLabel={t('map.my_location')}
      accessibilityRole="button"
      android_ripple={{ color: colors.rippleLight, borderless: true }}
      style={({ pressed }) => [styles.button, style, pressed && !loading && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={colors.primary} />
      )}
    </Pressable>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  pressed: {
    opacity: 0.85,
  },
});

export default MyLocationButton;
