import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Region } from 'react-native-maps';

import { QUICK_JUMPS } from '../data/quickJumps';
import { useAppLanguage } from '../i18n/useAppLanguage';
import { colors } from '../theme/colors';
import { RADIUS_PILL } from '../theme/radii';
import { SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';

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
    paddingVertical: SPACE_SM,
    paddingHorizontal: SPACE_XL,
    gap: SPACE_SM,
    alignItems: 'center',
  },
  pill: {
    height: 32,
    borderRadius: RADIUS_PILL,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pillPressed: {
    opacity: 0.85,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  trailingSpacer: {
    width: SPACE_MD,
  },
});

export default RegionQuickJumps;

// i18n-migrated
