import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { RADIUS_PILL } from '../theme/radii';
import { SPACE_MD, SPACE_SM, SPACE_XS } from '../theme/spacing';

type BadgeVariant = 'sinGluten' | 'verified' | 'priceRange' | 'cuisine' | 'neutral';

interface BadgePillProps {
  label: string;
  variant?: BadgeVariant;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
}

type VariantStyle = {
  backgroundColor: string;
  textColor: string;
  iconColor: string;
};

const variantStyles: Record<BadgeVariant, VariantStyle> = {
  sinGluten: {
    backgroundColor: colors.sinGlutenBg,
    textColor: colors.primary,
    iconColor: colors.primary,
  },
  verified: {
    backgroundColor: colors.verifiedGreen,
    textColor: colors.white,
    iconColor: colors.white,
  },
  priceRange: {
    backgroundColor: colors.overlayWhite20,
    textColor: colors.white,
    iconColor: colors.white,
  },
  cuisine: {
    backgroundColor: colors.cuisineSurface,
    textColor: colors.textSecondary,
    iconColor: colors.textSecondary,
  },
  neutral: {
    backgroundColor: colors.overlayWhite15,
    textColor: colors.white,
    iconColor: colors.white,
  },
};

function BadgePill({ label, variant = 'neutral', iconName }: BadgePillProps) {
  const scheme = variantStyles[variant];

  return (
    <View style={[styles.pill, { backgroundColor: scheme.backgroundColor }]}>
      {iconName ? (
        <MaterialCommunityIcons
          name={iconName}
          size={12}
          color={scheme.iconColor}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, { color: scheme.textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADIUS_PILL,
    paddingVertical: SPACE_SM - 2,
    paddingHorizontal: SPACE_MD,
  },
  icon: {
    marginRight: SPACE_XS,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default BadgePill;
