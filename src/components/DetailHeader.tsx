import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import HeartButton from './HeartButton';
import RestaurantHeroImage from './RestaurantHeroImage';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

import type { Restaurant } from '../types/Restaurant';

interface DetailHeaderProps {
  restaurant: Restaurant;
  onBack?: () => void;
}

const HERO_HEIGHT = 280;

/**
 * Hero-Bereich der Detail-Seite: Vollblech-Foto mit frosted Controls.
 */
function DetailHeader({ restaurant, onBack }: DetailHeaderProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrapper}>
      <View style={styles.imageContainer}>
        <RestaurantHeroImage restaurant={restaurant} iconSize={96} />

        <LinearGradient
          colors={['rgba(0,0,0,0.22)', 'transparent', 'transparent']}
          locations={[0, 0.35, 1]}
          style={styles.topGradient}
          pointerEvents="none"
        />

        <View style={[styles.topControls, { top: insets.top + spacing.cardPadding }]}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color={colors.textPrimary} />
            </Pressable>
          ) : (
            <View style={styles.iconSpacer} />
          )}

          <HeartButton restaurantId={restaurant.id} variant="overlay" />
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  imageContainer: {
    height: HERO_HEIGHT,
    position: 'relative',
    backgroundColor: colors.surfaceAlt,
  },
  topGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 120,
  },
  topControls: {
    position: 'absolute',
    left: spacing.screenPadding,
    right: spacing.screenPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacer: {
    width: 40,
    height: 40,
  },
  iconPressed: {
    opacity: 0.85,
  },
});

export default DetailHeader;

// i18n-migrated
