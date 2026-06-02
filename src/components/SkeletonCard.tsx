import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme/colors';

// Nur kurz beim ersten Laden sichtbar; bei statischem JSON-Asset reicht es,
// 3–5 Skeleton-Cards fuer ca. 200 ms zu zeigen.

function SkeletonCard() {
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.imageArea, pulseStyle]}>
        <View style={styles.badgeRow}>
          <View style={styles.badgePlaceholder} />
          <View style={styles.badgePlaceholderWide} />
        </View>
      </Animated.View>

      <View style={styles.body}>
        <Animated.View style={[styles.titlePlaceholder, pulseStyle]} />
        <Animated.View style={[styles.linePlaceholder, pulseStyle]} />
        <Animated.View style={[styles.linePlaceholderShort, pulseStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  imageArea: {
    height: 200,
    backgroundColor: colors.surface,
    padding: 12,
    justifyContent: 'flex-end',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgePlaceholder: {
    width: 72,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgePlaceholderWide: {
    width: 100,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  titlePlaceholder: {
    height: 18,
    width: '70%',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  linePlaceholder: {
    height: 14,
    width: '90%',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  linePlaceholderShort: {
    height: 14,
    width: '55%',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

export default SkeletonCard;
