import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppLanguage } from '../i18n/useAppLanguage';
import type { AppLanguage } from '../i18n/getLocalizedName';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { DeliveryLink, Restaurant } from '../types/Restaurant';
import { openUrl } from '../utils/openExternalUrl';

interface DeliveryButtonsProps {
  restaurant: Restaurant;
}

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const PLATFORM_HINT: Record<AppLanguage, (platform: string) => string> = {
  es: (platform) => `Disponible en ${platform} (busca el nombre del restaurante)`,
  en: (platform) => `Available on ${platform} (search for the restaurant name)`,
  de: (platform) => `Verfügbar bei ${platform} (Restaurantname suchen)`,
};

const DELIVERY_PLATFORMS: Record<string, { label: string; color: string; icon: IconName }> = {
  glovo: { label: 'Glovo', color: '#FFC107', icon: 'bike-fast' },
  just_eat: { label: 'Just Eat', color: '#FF8000', icon: 'food' },
  uber_eats: { label: 'Uber Eats', color: '#06C167', icon: 'silverware-fork-knife' },
  wolt: { label: 'Wolt', color: '#009DE0', icon: 'bike' },
  deliveroo: { label: 'Deliveroo', color: '#00CCBC', icon: 'bike' },
  own_delivery: { label: 'Pedido propio', color: colors.primaryDark, icon: 'home' },
};

const DELIVERY_HOME_URLS: Record<string, string> = {
  glovo: 'https://glovoapp.com/',
  just_eat: 'https://www.just-eat.es/',
  uber_eats: 'https://www.ubereats.com/',
  wolt: 'https://wolt.com/',
  deliveroo: 'https://deliveroo.es/',
  own_delivery: 'https://www.google.com/search?q=delivery+restaurant',
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

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function filterDeliveryLinks(links: DeliveryLink[] | undefined) {
  return (links ?? []).filter(
    (link) => link.is_active !== false && link.platform !== 'no_delivery'
  );
}

/**
 * Lieferdienst-Buttons und Hinweise fuer Plattformen ohne direkte URL.
 */
function DeliveryButtons({ restaurant }: DeliveryButtonsProps) {
  const { t } = useTranslation();
  const language = useAppLanguage();
  const activeLinks = filterDeliveryLinks(restaurant.delivery_links);
  const withUrl = activeLinks.filter((link) => link.url?.trim());
  const withoutUrl = activeLinks.filter((link) => !link.url?.trim());

  if (withUrl.length === 0 && withoutUrl.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="moped" size={18} color={colors.primary} />
        <Text style={styles.title}>{t('detail.delivery')}</Text>
      </View>

      {withUrl.map((link) => {
        const meta = getPlatformMeta(link.platform);
        return (
          <Pressable
            key={`${link.platform}-url`}
            onPress={() => {
              openUrl(normalizeUrl(link.url)).catch(() => undefined);
            }}
            android_ripple={{ color: colors.rippleLight }}
            style={({ pressed }) => [styles.platformButton, pressed && styles.pressed]}
          >
            <View style={[styles.iconBadge, { backgroundColor: meta.color }]}>
              <MaterialCommunityIcons name={meta.icon} size={18} color={colors.white} />
            </View>
            <Text style={styles.platformLabel}>{meta.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </Pressable>
        );
      })}

      {withoutUrl.map((link) => {
        const meta = getPlatformMeta(link.platform);
        const homeUrl = DELIVERY_HOME_URLS[link.platform] ?? 'https://www.google.com';
        return (
          <Pressable
            key={`${link.platform}-hint`}
            onPress={() => {
              openUrl(homeUrl).catch(() => undefined);
            }}
            style={({ pressed }) => [styles.hintBanner, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="information-outline" size={18} color={colors.primary} />
            <Text style={styles.hintText}>{PLATFORM_HINT[language](meta.label)}</Text>
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
  platformLabel: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
    color: colors.textPrimary,
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.cardPadding,
    marginBottom: spacing.sm,
  },
  hintText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.9,
  },
});

export default DeliveryButtons;
