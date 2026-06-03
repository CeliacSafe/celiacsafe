import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Region } from 'react-native-maps';

import { QUICK_JUMPS } from '../data/quickJumps';
import { useAppLanguage } from '../i18n/useAppLanguage';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';

interface RegionQuickJumpsProps {
  onJumpTo: (region: Region) => void;
}

/**
 * Horizontale Shortcut-Pills zum schnellen Springen auf Kartenregionen.
 */
function RegionQuickJumps({ onJumpTo }: RegionQuickJumpsProps) {
  const language = useAppLanguage();
  return (
    <View style={styles.bar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_JUMPS.map((jump) => (
          <Pressable
            key={jump.code}
            android_ripple={{ color: colors.rippleLight, borderless: false }}
            onPress={() => onJumpTo(jump.region)}
            style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
          >
            <Text style={styles.label}>{jump.labels[language]}</Text>
          </Pressable>
        ))}
        <View style={styles.trailingSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(18, 18, 18, 0.88)',
  },
  scrollContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.sm,
    alignItems: 'center',
  },
  pill: {
    height: spacing.xl,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + spacing.xs,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pillPressed: {
    opacity: 0.85,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  trailingSpacer: {
    width: spacing.cardPadding,
  },
});

export default RegionQuickJumps;

// i18n-migrated
