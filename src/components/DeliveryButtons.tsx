import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppLanguage } from '../i18n/getLocalizedName';
import { colors } from '../theme/colors';
import { RADIUS_SUB } from '../theme/radii';
import { SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
import type { DeliveryLink, Restaurant } from '../types/Restaurant';
import { openUrl } from '../utils/openExternalUrl';

interface DeliveryButtonsProps {
  restaurant: Restaurant;
  language?: AppLanguage;
}

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const SECTION_TITLES: Record<AppLanguage, string> = {
  es: 'Pedidos a domicilio',
  en: 'Delivery',
  de: 'Lieferdienste',
};

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
function DeliveryButtons({ restaurant, language = 'es' }: DeliveryButtonsProps) {
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
        <Text style={styles.title}>{SECTION_TITLES[language]}</Text>
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
    paddingHorizontal: SPACE_XL,
    paddingVertical: SPACE_MD,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_SM,
    marginBottom: SPACE_MD,
  },
  title: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_MD,
    backgroundColor: colors.surface,
    borderRadius: RADIUS_SUB,
    padding: SPACE_MD,
    marginBottom: SPACE_SM,
    overflow: 'hidden',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS_SUB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACE_SM,
    backgroundColor: colors.surface,
    borderRadius: RADIUS_SUB,
    padding: SPACE_MD,
    marginBottom: SPACE_SM,
  },
  hintText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.9,
  },
});

export default DeliveryButtons;
