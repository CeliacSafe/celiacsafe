import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';

interface MyLocationButtonProps {
  onPress: () => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Schwebender Button zur Zentrierung der Karte auf die Nutzerposition.
 */
function MyLocationButton({ onPress, loading = false, style }: MyLocationButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityLabel="Mi ubicación"
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

const styles = StyleSheet.create({
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
