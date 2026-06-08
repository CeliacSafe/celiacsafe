import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

// Nur kurz beim ersten Laden sichtbar; bei statischem JSON-Asset reicht es,
// 3–5 Skeleton-Cards fuer ca. 200 ms zu zeigen.

function SkeletonCard() {
  const styles = useThemedStyles(createStyles);
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

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    height: 280,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  imageArea: {
    height: 200,
    backgroundColor: colors.surface,
    padding: spacing.cardPadding,
    justifyContent: 'flex-end',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badgePlaceholder: {
    width: 72,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.skeletonMuted,
  },
  badgePlaceholderWide: {
    width: 100,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.skeletonMuted,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.cardPadding,
    gap: spacing.sm,
  },
  titlePlaceholder: {
    height: 18,
    width: '70%',
    borderRadius: radius.sm,
    backgroundColor: colors.skeletonStrong,
  },
  linePlaceholder: {
    height: 14,
    width: '90%',
    borderRadius: radius.sm,
    backgroundColor: colors.skeletonMuted,
  },
  linePlaceholderShort: {
    height: 14,
    width: '55%',
    borderRadius: radius.sm,
    backgroundColor: colors.skeletonMuted,
  },
});

export default SkeletonCard;
