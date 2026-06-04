import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';
import { getActiveDeliveryLinks, resolveDeliveryUrl } from '../utils/platformLinks';
import { openUrl } from '../utils/openExternalUrl';

interface DeliveryButtonsProps {
  restaurant: Restaurant;
}

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const DELIVERY_PLATFORMS: Record<string, { label: string; color: string; icon: IconName }> = {
  glovo: { label: 'Glovo', color: '#FFC107', icon: 'bike-fast' },
  just_eat: { label: 'Just Eat', color: '#FF8000', icon: 'food' },
  uber_eats: { label: 'Uber Eats', color: '#06C167', icon: 'silverware-fork-knife' },
  wolt: { label: 'Wolt', color: '#009DE0', icon: 'bike' },
  deliveroo: { label: 'Deliveroo', color: '#00CCBC', icon: 'bike' },
  own_delivery: { label: 'Lieferung', color: colors.primaryDark, icon: 'home' },
};

function getPlatformMeta(platform: string) {
  return (
    DELIVERY_PLATFORMS[platform] ?? {
      label: platform,
      color: colors.primary,
      icon: 'truck-delivery' as IconName,
    }
  );
}

function DeliveryButtons({ restaurant }: DeliveryButtonsProps) {
  const { t } = useTranslation();
  const activeLinks = getActiveDeliveryLinks(restaurant);

  if (activeLinks.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="moped" size={18} color={colors.primary} />
        <Text style={styles.title}>{t('detail.delivery')}</Text>
      </View>

      {activeLinks.map((link) => {
        const meta = getPlatformMeta(link.platform);
        const targetUrl = resolveDeliveryUrl(restaurant, link);
        if (!targetUrl) {
          return null;
        }

        return (
          <Pressable
            key={link.platform}
            onPress={() => {
              openUrl(targetUrl).catch(() => undefined);
            }}
            android_ripple={{ color: colors.rippleLight }}
            style={({ pressed }) => [styles.platformButton, pressed && styles.pressed]}
            accessibilityRole="link"
            accessibilityLabel={`${meta.label}, ${restaurant.name}`}
          >
            <View style={[styles.iconBadge, { backgroundColor: meta.color }]}>
              <MaterialCommunityIcons name={meta.icon} size={18} color={colors.white} />
            </View>
            <View style={styles.labelBlock}>
              <Text style={styles.platformLabel}>{meta.label}</Text>
              <Text style={styles.platformHint}>{t('detail.delivery_open', { name: restaurant.name })}</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={20} color={colors.textSecondary} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.cardPadding,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.cardPadding,
  },
  title: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.primary,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.cardPadding,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.cardPadding,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBlock: {
    flex: 1,
  },
  platformLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  platformHint: {
    ...typography.caption,
    marginTop: 2,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.9,
  },
});

export default DeliveryButtons;
