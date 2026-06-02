import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

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
    backgroundColor: 'rgba(46, 125, 50, 0.45)',
    textColor: colors.primary,
    iconColor: colors.primary,
  },
  verified: {
    backgroundColor: '#1B5E20',
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  priceRange: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  cuisine: {
    backgroundColor: '#2A2A2A',
    textColor: colors.textSecondary,
    iconColor: colors.textSecondary,
  },
  neutral: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
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
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default BadgePill;
