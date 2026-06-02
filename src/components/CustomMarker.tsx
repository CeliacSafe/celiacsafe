import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

interface CustomMarkerProps {
  isFavorite?: boolean;
  isSelected?: boolean;
}

/**
 * Eigenes Marker-Symbol fuer react-native-maps.
 * Als Kind von <Marker> eingesetzt — ersetzt den Standard-Pin.
 */
const CustomMarker = memo(function MarkerPin({
  isFavorite = false,
  isSelected = false,
}: CustomMarkerProps) {
  const iconName = isFavorite ? 'heart' : 'silverware-fork-knife';

  return (
    <View style={styles.outer}>
      {isSelected ? <View style={styles.glow} /> : null}

      <View style={styles.markerColumn}>
        <View style={styles.circle}>
          <MaterialCommunityIcons name={iconName} size={16} color={colors.background} />
        </View>
        <View style={styles.pinTip} />
      </View>
    </View>
  );
});

CustomMarker.displayName = 'CustomMarker';

const styles = StyleSheet.create({
  outer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(165, 214, 167, 0.3)',
  },
  markerColumn: {
    alignItems: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pinTip: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
  },
});

export default CustomMarker;
