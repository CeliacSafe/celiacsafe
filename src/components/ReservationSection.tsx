import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { ReservationLink, Restaurant } from '../types/Restaurant';
import { getActiveReservationLinks, resolveReservationUrl } from '../utils/platformLinks';
import { openPhone, openUrl } from '../utils/openExternalUrl';

interface ReservationSectionProps {
  restaurant: Restaurant;
}

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const createReservationPlatforms = (
  colors: AppColors
): Record<string, { label: string; color: string; icon: IconName }> => ({
  thefork: { label: 'TheFork', color: colors.verifiedGreen, icon: 'silverware-fork-knife' },
  opentable: { label: 'OpenTable', color: '#DA3743', icon: 'calendar' },
  quandoo: { label: 'Quandoo', color: '#FFC72C', icon: 'calendar-check' },
  own_website: { label: 'Web propia', color: colors.primaryDark, icon: 'web' },
  phone_only: { label: 'Por teléfono', color: colors.primaryDark, icon: 'phone' },
  walk_in_only: { label: 'Sin reserva', color: '#757575', icon: 'walk' },
  instagram_dm: { label: 'Instagram DM', color: '#E1306C', icon: 'instagram' },
});

function getPlatformMeta(platform: string, colors: AppColors) {
  return (
    createReservationPlatforms(colors)[platform] ?? {
      label: platform,
      color: colors.primary,
      icon: 'calendar' as IconName,
    }
  );
}

interface ReservationAction {
  key: string;
  label: string;
  subtitle?: string;
  icon: IconName;
  onPress?: () => void;
  isHint?: boolean;
}

function buildActions(
  restaurant: Restaurant,
  links: ReservationLink[],
  t: (key: string) => string,
  colors: AppColors
): ReservationAction[] {
  const actions: ReservationAction[] = [];

  for (const link of links) {
    const meta = getPlatformMeta(link.platform, colors);

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

    const targetUrl = resolveReservationUrl(restaurant, link);
    if (targetUrl) {
      actions.push({
        key: `${link.platform}-${targetUrl}`,
        label: meta.label,
        subtitle:
          link.platform === 'thefork' ? t('detail.reservation_thefork_hint') : undefined,
        icon: meta.icon,
        onPress: () => openUrl(targetUrl).catch(() => undefined),
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
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const activeLinks = getActiveReservationLinks(restaurant);
  const actions = buildActions(restaurant, activeLinks, t, colors);

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
          <MaterialCommunityIcons name={singleAction.icon} size={22} color={colors.onPrimary} />
          <View style={styles.buttonTextBlock}>
            <Text style={styles.primaryLabel}>{singleAction.label}</Text>
            {singleAction.subtitle ? (
              <Text style={styles.primarySubtitle}>{singleAction.subtitle}</Text>
            ) : null}
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.onPrimary} />
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

const createStyles = (colors: AppColors) => StyleSheet.create({
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
  primaryButton: {
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.cardPadding,
    overflow: 'hidden',
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.cardPadding,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  buttonTextBlock: {
    flex: 1,
  },
  primaryLabel: {
    ...typography.button,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  primarySubtitle: {
    ...typography.caption,
    marginTop: 2,
    color: colors.onPrimary,
    opacity: 0.9,
  },
  secondaryLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  secondarySubtitle: {
    ...typography.caption,
    marginTop: 2,
    color: colors.textSecondary,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.cardPadding,
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

export default ReservationSection;
