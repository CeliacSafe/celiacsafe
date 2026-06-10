import { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import type { MapPinStyle } from '../utils/mapPinStyle';

interface CustomMarkerProps {
  pinStyle: MapPinStyle;
  isSelected?: boolean;
  isFeatured?: boolean;
}

const PIN_SIZE = 36;
const PIN_SIZE_FEATURED = 44;

/**
 * Farbkodierter Teardrop-Pin nach Lokalkategorie (Café/Bäckerei, Restaurant, Pizza/Fast Food).
 */
const CustomMarker = memo(function MarkerPin({
  pinStyle,
  isSelected = false,
  isFeatured = false,
}: CustomMarkerProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const highlighted = isSelected || isFeatured;
  const pinSize = highlighted ? PIN_SIZE_FEATURED : PIN_SIZE;
  const iconSize = highlighted ? 16 : 14;
  const pinColor = highlighted ? colors.accent : pinStyle.fill;

  return (
    <View style={[styles.outer, highlighted && styles.outerFeatured]}>
      {highlighted ? <View style={[styles.glow, { backgroundColor: `${pinStyle.fill}48` }]} /> : null}
      <View
        style={[
          styles.pin,
          {
            width: pinSize,
            height: pinSize,
            backgroundColor: pinColor,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={pinStyle.icon}
          size={iconSize}
          color={colors.onPrimary}
          style={styles.icon}
        />
      </View>
    </View>
  );
});

CustomMarker.displayName = 'CustomMarker';

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    outer: {
      width: PIN_SIZE,
      height: PIN_SIZE + 4,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    outerFeatured: {
      width: PIN_SIZE_FEATURED + 16,
      height: PIN_SIZE_FEATURED + 16,
    },
    glow: {
      position: 'absolute',
      bottom: 0,
      width: PIN_SIZE_FEATURED + 16,
      height: PIN_SIZE_FEATURED + 16,
      borderRadius: (PIN_SIZE_FEATURED + 16) / 2,
    },
    pin: {
      borderTopLeftRadius: PIN_SIZE / 2,
      borderTopRightRadius: PIN_SIZE / 2,
      borderBottomLeftRadius: PIN_SIZE / 2,
      borderBottomRightRadius: 0,
      transform: [{ rotate: '-45deg' }],
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    icon: {
      transform: [{ rotate: '45deg' }],
    },
  });

export default CustomMarker;
