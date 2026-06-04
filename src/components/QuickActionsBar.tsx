import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { WHATSAPP_DEFAULT_MESSAGES } from '../i18n/contact';
import { useAppLanguage } from '../i18n/useAppLanguage';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';
import {
  getActiveDeliveryLinks,
  getActiveReservationLinks,
  resolveDeliveryUrl,
  resolveReservationUrl,
} from '../utils/platformLinks';
import { openMapsRouting, openPhone, openUrl, openWhatsApp } from '../utils/openExternalUrl';

interface QuickActionsBarProps {
  restaurant: Restaurant;
}

type ActionIconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface QuickAction {
  key: string;
  icon: ActionIconName;
  label: string;
  onPress: () => void;
}

function normalizeWebsiteUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function QuickActionsBar({ restaurant }: QuickActionsBarProps) {
  const { t } = useTranslation();
  const language = useAppLanguage();
  const actions: QuickAction[] = [];

  if (restaurant.phone) {
    actions.push({
      key: 'call',
      icon: 'phone',
      label: t('detail.call'),
      onPress: () => openPhone(restaurant.phone!),
    });
  }

  if (restaurant.whatsapp) {
    actions.push({
      key: 'whatsapp',
      icon: 'whatsapp',
      label: t('detail.whatsapp'),
      onPress: () => openWhatsApp(restaurant.whatsapp!, WHATSAPP_DEFAULT_MESSAGES[language]),
    });
  }

  if (restaurant.website) {
    actions.push({
      key: 'website',
      icon: 'web',
      label: t('detail.website'),
      onPress: () => {
        openUrl(normalizeWebsiteUrl(restaurant.website!)).catch(() => undefined);
      },
    });
  }

  if (restaurant.menu_url?.trim()) {
    actions.push({
      key: 'menu',
      icon: 'book-open-page-variant',
      label: t('detail.menu'),
      onPress: () => {
        openUrl(normalizeWebsiteUrl(restaurant.menu_url!.trim())).catch(() => undefined);
      },
    });
  }

  if (restaurant.latitude != null && restaurant.longitude != null) {
    actions.push({
      key: 'route',
      icon: 'map-marker-radius',
      label: t('detail.route'),
      onPress: () => openMapsRouting(restaurant.latitude!, restaurant.longitude!, restaurant.name),
    });
  }

  const theForkLink = getActiveReservationLinks(restaurant).find((l) => l.platform === 'thefork');
  const theForkUrl = theForkLink ? resolveReservationUrl(restaurant, theForkLink) : null;
  if (theForkUrl) {
    actions.push({
      key: 'thefork',
      icon: 'silverware-fork-knife',
      label: t('detail.reserve_thefork'),
      onPress: () => openUrl(theForkUrl).catch(() => undefined),
    });
  }

  for (const platform of ['glovo', 'uber_eats'] as const) {
    const link = getActiveDeliveryLinks(restaurant).find((l) => l.platform === platform);
    const url = link ? resolveDeliveryUrl(restaurant, link) : null;
    if (!url) continue;
    actions.push({
      key: platform,
      icon: platform === 'glovo' ? 'bike-fast' : 'food',
      label: platform === 'glovo' ? t('detail.order_glovo') : t('detail.order_ubereats'),
      onPress: () => openUrl(url).catch(() => undefined),
    });
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            android_ripple={{ color: colors.rippleLight, borderless: false }}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
          >
            <MaterialCommunityIcons name={action.icon} size={24} color={colors.primary} />
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
        <View style={styles.trailingSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing.cardPadding,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.cardPadding,
    paddingBottom: spacing.md,
  },
  actionButton: {
    width: 72,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    overflow: 'hidden',
  },
  actionPressed: {
    opacity: 0.9,
  },
  actionLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  trailingSpacer: {
    width: spacing.cardPadding,
  },
});

export default QuickActionsBar;

// i18n-migrated
