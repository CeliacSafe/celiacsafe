import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppLanguage } from '../i18n/useAppLanguage';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { fontFamilies } from '../theme/fonts';
import { radius, shadows, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';
import { hapticLight } from '../utils/haptics';
import {
  formatCommunityFeedActivity,
  getCommunityAvatarColor,
  getCommunityVerifierInitials,
  getCommunityVerifierName,
} from '../utils/communityFeed';

interface RecentVerifiedFeedCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

function RecentVerifiedFeedCard({ restaurant, onPress }: RecentVerifiedFeedCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const language = useAppLanguage();

  const verifierName = getCommunityVerifierName(restaurant, language);
  const initials = getCommunityVerifierInitials(verifierName);
  const avatarColor = getCommunityAvatarColor(restaurant.id);
  const activityText = formatCommunityFeedActivity(restaurant, language, t);

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${restaurant.name}, ${restaurant.city}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text style={styles.city} numberOfLines={1}>
          {restaurant.city}
        </Text>
        {activityText ? (
          <Text style={styles.activity} numberOfLines={2}>
            {activityText}
          </Text>
        ) : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.lineSoft,
      padding: spacing.cardPadding,
      ...shadows.small,
    },
    cardPressed: {
      opacity: 0.9,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: fontFamilies.sansSemiBold,
      fontSize: 13,
      lineHeight: 16,
      color: colors.onPrimary,
      letterSpacing: 0.2,
    },
    content: {
      flex: 1,
      gap: 2,
      minWidth: 0,
    },
    name: {
      ...typography.body,
      fontFamily: fontFamilies.sansSemiBold,
      color: colors.textPrimary,
    },
    city: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    activity: {
      ...typography.caption,
      color: colors.primary,
      marginTop: spacing.xs,
      lineHeight: 16,
    },
  });

export default RecentVerifiedFeedCard;
