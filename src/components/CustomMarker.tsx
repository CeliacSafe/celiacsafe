import { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';

interface CustomMarkerProps {
  isSelected?: boolean;
  isFeatured?: boolean;
}

const PIN_SIZE = 36;
const PIN_SIZE_FEATURED = 44;
const DOT_SIZE = 12;
const DOT_SIZE_FEATURED = 14;

/**
 * Teardrop-Pin fuer react-native-maps (Sage / Saffron bei Auswahl oder Premium).
 */
const CustomMarker = memo(function MarkerPin({
  isSelected = false,
  isFeatured = false,
}: CustomMarkerProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const highlighted = isSelected || isFeatured;
  const pinSize = highlighted ? PIN_SIZE_FEATURED : PIN_SIZE;
  const dotSize = highlighted ? DOT_SIZE_FEATURED : DOT_SIZE;
  const pinColor = highlighted ? colors.accent : colors.primary;

  return (
    <View style={[styles.outer, highlighted && styles.outerFeatured]}>
      {highlighted ? <View style={styles.glow} /> : null}
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
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
            },
          ]}
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
      backgroundColor: 'rgba(212, 134, 58, 0.28)',
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
    dot: {
      borderRadius: DOT_SIZE / 2,
      backgroundColor: colors.background,
      transform: [{ rotate: '45deg' }],
    },
  });

export default CustomMarker;
