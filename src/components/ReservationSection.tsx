import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import { RADIUS_INPUT, RADIUS_SUB } from '../theme/radii';
import { SPACE_LG, SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
import type { ReservationLink, Restaurant } from '../types/Restaurant';
import { openPhone, openUrl } from '../utils/openExternalUrl';

interface ReservationSectionProps {
  restaurant: Restaurant;
}

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const RESERVATION_PLATFORMS: Record<string, { label: string; color: string; icon: IconName }> = {
  thefork: { label: 'TheFork', color: colors.verifiedGreen, icon: 'silverware-fork-knife' },
  opentable: { label: 'OpenTable', color: '#DA3743', icon: 'calendar' },
  quandoo: { label: 'Quandoo', color: '#FFC72C', icon: 'calendar-check' },
  own_website: { label: 'Web propia', color: colors.primaryDark, icon: 'web' },
  phone_only: { label: 'Por teléfono', color: colors.primaryDark, icon: 'phone' },
  walk_in_only: { label: 'Sin reserva', color: '#757575', icon: 'walk' },
  instagram_dm: { label: 'Instagram DM', color: '#E1306C', icon: 'instagram' },
};

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getPlatformMeta(platform: string) {
  return (
    RESERVATION_PLATFORMS[platform] ?? {
      label: platform,
      color: colors.primary,
      icon: 'calendar' as IconName,
    }
  );
}

function filterReservationLinks(links: ReservationLink[] | undefined) {
  return (links ?? []).filter((link) => link.is_active !== false);
}

interface ReservationAction {
  key: string;
  label: string;
  subtitle?: string;
  icon: IconName;
  onPress?: () => void;
  isHint?: boolean;
}

function buildActions(restaurant: Restaurant, links: ReservationLink[]): ReservationAction[] {
  const actions: ReservationAction[] = [];

  for (const link of links) {
    const meta = getPlatformMeta(link.platform);

    if (link.platform === 'walk_in_only') {
      actions.push({
        key: link.platform,
        label: meta.label,
        icon: meta.icon,
        isHint: true,
      });
      continue;
    }

    if (link.platform === 'phone_only') {
      if (!restaurant.phone) {
        continue;
      }
      actions.push({
        key: link.platform,
        label: meta.label,
        subtitle: restaurant.phone,
        icon: meta.icon,
        onPress: () => openPhone(restaurant.phone!),
      });
      continue;
    }

    if (link.url?.trim()) {
      actions.push({
        key: `${link.platform}-${link.url}`,
        label: meta.label,
        subtitle: link.url,
        icon: meta.icon,
        onPress: () => openUrl(normalizeUrl(link.url)).catch(() => undefined),
      });
    }
  }

  return actions;
}

/**
 * Reservierungs-Buttons fuer TheFork, Telefon, Walk-in und weitere Kanaele.
 */
function ReservationSection({ restaurant }: ReservationSectionProps) {
  const { t } = useTranslation();
  const activeLinks = filterReservationLinks(restaurant.reservation_links);
  const actions = buildActions(restaurant, activeLinks);

  if (actions.length === 0) {
    return null;
  }

  const isSingle = actions.length === 1;
  const singleAction = actions[0];

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
        <Text style={styles.title}>{t('detail.reservation')}</Text>
      </View>

      {isSingle && singleAction.isHint ? (
        <View style={styles.hintBox}>
          <MaterialCommunityIcons name={singleAction.icon} size={20} color={colors.textSecondary} />
          <Text style={styles.hintText}>{t('detail.reservation_walk_in')}</Text>
        </View>
      ) : null}

      {isSingle && !singleAction.isHint && singleAction.onPress ? (
        <Pressable
          onPress={singleAction.onPress}
          android_ripple={{ color: colors.rippleLight }}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name={singleAction.icon} size={22} color={colors.background} />
          <View style={styles.buttonTextBlock}>
            <Text style={styles.primaryLabel}>{singleAction.label}</Text>
            {singleAction.subtitle ? (
              <Text style={styles.primarySubtitle}>{singleAction.subtitle}</Text>
            ) : null}
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.background} />
        </Pressable>
      ) : null}

      {!isSingle
        ? actions.map((action) => {
            if (action.isHint) {
              return (
                <View key={action.key} style={styles.hintBox}>
                  <MaterialCommunityIcons
                    name={action.icon}
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.hintText}>{t('detail.reservation_walk_in')}</Text>
                </View>
              );
            }

            if (!action.onPress) {
              return null;
            }

            return (
              <Pressable
                key={action.key}
                onPress={action.onPress}
                android_ripple={{ color: colors.rippleLight }}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name={action.icon} size={20} color={colors.primary} />
                <View style={styles.buttonTextBlock}>
                  <Text style={styles.secondaryLabel}>{action.label}</Text>
                  {action.subtitle ? (
                    <Text style={styles.secondarySubtitle} numberOfLines={1}>
                      {action.subtitle}
                    </Text>
                  ) : null}
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            );
          })
        : null}
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
  primaryButton: {
    height: 56,
    borderRadius: RADIUS_INPUT,
    backgroundColor: colors.primary,
    paddingHorizontal: SPACE_LG,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_MD,
    overflow: 'hidden',
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: RADIUS_SUB,
    backgroundColor: colors.surface,
    paddingHorizontal: SPACE_LG,
    paddingVertical: SPACE_SM,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_MD,
    marginBottom: SPACE_SM,
    overflow: 'hidden',
  },
  buttonTextBlock: {
    flex: 1,
  },
  primaryLabel: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  primarySubtitle: {
    marginTop: 2,
    color: colors.background,
    fontSize: 12,
    opacity: 0.9,
  },
  secondaryLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  secondarySubtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 12,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_SM,
    backgroundColor: colors.surface,
    borderRadius: RADIUS_SUB,
    padding: SPACE_MD,
  },
  hintText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.9,
  },
});

export default ReservationSection;
