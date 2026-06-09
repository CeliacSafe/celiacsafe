import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { fontFamilies } from '../theme/fonts';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface MapMarkerCalloutProps {
  name: string;
  venueTypeLabel: string | null;
  onNamePress: () => void;
}

/** Kompakte Karten-Vorschau: Name (tippbar) + Restaurantart. */
export default function MapMarkerCallout({
  name,
  venueTypeLabel,
  onNamePress,
}: MapMarkerCalloutProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onNamePress}
        accessibilityRole="button"
        accessibilityLabel={name}
        style={({ pressed }) => [styles.nameButton, pressed && styles.namePressed]}
      >
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
      </Pressable>
      {venueTypeLabel ? (
        <Text style={styles.venueType} numberOfLines={1}>
          {venueTypeLabel}
        </Text>
      ) : null}
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    wrap: {
      minWidth: 140,
      maxWidth: 220,
      paddingVertical: spacing.xs,
      gap: 2,
    },
    nameButton: {
      alignSelf: 'flex-start',
    },
    namePressed: {
      opacity: 0.85,
    },
    name: {
      fontFamily: fontFamilies.serif,
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: -0.3,
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    venueType: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
