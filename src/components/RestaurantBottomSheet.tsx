/**
 * Bottom-Sheet mit Restaurant-Vorschau und Schnellaktionen nach Marker-Tap auf der Karte.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BadgePill from './BadgePill';
import { useLocalized } from '../hooks/useLocalized';
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
import { openUrl } from '../utils/openExternalUrl';

interface RestaurantBottomSheetProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  onDetailPress: (id: string) => void;
}

export interface RestaurantBottomSheetRef {
  expand: () => void;
  close: () => void;
}

type ActionIconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface ActionItem {
  icon: ActionIconName;
  label: string;
  visible: boolean;
  onPress: () => void;
}

const RestaurantBottomSheet = forwardRef<RestaurantBottomSheetRef, RestaurantBottomSheetProps>(
  ({ restaurant, onClose, onDetailPress }, ref) => {
    const { t } = useTranslation();
    const { regionName, cuisineName } = useLocalized();
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['40%', '70%'], []);

    useImperativeHandle(ref, () => ({
      expand: () => sheetRef.current?.snapToIndex(0),
      close: () => sheetRef.current?.close(),
    }));

    // Sheet oeffnet/schliesst automatisch, wenn sich das ausgewaehlte Restaurant aendert.
    useEffect(() => {
      if (restaurant) {
        sheetRef.current?.snapToIndex(0);
      } else {
        sheetRef.current?.close();
      }
    }, [restaurant]);

    const handleSheetChange = (index: number) => {
      if (index === -1) {
        onClose();
      }
    };

    const showVerificationBadge =
      restaurant?.face_program === true || restaurant?.aoecs_certified === true;

    const theForkLink = restaurant
      ? getActiveReservationLinks(restaurant).find((l) => l.platform === 'thefork')
      : undefined;
    const theForkUrl =
      restaurant && theForkLink ? resolveReservationUrl(restaurant, theForkLink) : null;

    const glovoLink = restaurant
      ? getActiveDeliveryLinks(restaurant).find((l) => l.platform === 'glovo')
      : undefined;
    const glovoUrl = restaurant && glovoLink ? resolveDeliveryUrl(restaurant, glovoLink) : null;

    const uberLink = restaurant
      ? getActiveDeliveryLinks(restaurant).find((l) => l.platform === 'uber_eats')
      : undefined;
    const uberUrl = restaurant && uberLink ? resolveDeliveryUrl(restaurant, uberLink) : null;

    const actions: ActionItem[] = restaurant
      ? [
          {
            icon: 'silverware-fork-knife',
            label: t('detail.reserve_thefork'),
            visible: Boolean(theForkUrl),
            onPress: () => {
              if (theForkUrl) {
                openUrl(theForkUrl).catch(() => undefined);
              }
            },
          },
          {
            icon: 'bike-fast',
            label: t('detail.order_glovo'),
            visible: Boolean(glovoUrl),
            onPress: () => {
              if (glovoUrl) {
                openUrl(glovoUrl).catch(() => undefined);
              }
            },
          },
          {
            icon: 'food',
            label: t('detail.order_ubereats'),
            visible: Boolean(uberUrl),
            onPress: () => {
              if (uberUrl) {
                openUrl(uberUrl).catch(() => undefined);
              }
            },
          },
          {
            icon: 'phone',
            label: t('detail.call'),
            visible: Boolean(restaurant.phone),
            onPress: () => openTel(restaurant.phone!),
          },
          {
            icon: 'web',
            label: t('detail.website'),
            visible: Boolean(restaurant.website),
            onPress: () => openExternalUrl(restaurant.website!),
          },
          {
            icon: 'book-open-page-variant',
            label: t('detail.menu'),
            visible: Boolean(restaurant.menu_url),
            onPress: () => openExternalUrl(restaurant.menu_url!),
          },
          {
            icon: 'map',
            label: t('detail.route'),
            visible: restaurant.latitude != null && restaurant.longitude != null,
            onPress: () => openMaps(restaurant.latitude!, restaurant.longitude!),
          },
          {
            icon: 'information',
            label: t('map.view_detail'),
            visible: true,
            onPress: () => onDetailPress(restaurant.id),
          },
        ]
      : [];

    const visibleActions = actions.filter((action) => action.visible);

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChange}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
      >
        {restaurant ? (
          <BottomSheetScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Text style={styles.name}>{restaurant.name}</Text>
              <Text style={styles.location}>
                {restaurant.city} · {regionName(restaurant.region_code)}
              </Text>
            </View>

            <View style={styles.badgeRow}>
              <BadgePill
                label={t('card.badge_sin_gluten')}
                variant="sinGluten"
                iconName="check-circle"
              />
              {showVerificationBadge ? (
                <BadgePill
                  label={t('card.badge_verified')}
                  variant="verified"
                  iconName="shield-check"
                />
              ) : null}
              {restaurant.price_range ? (
                <BadgePill label={restaurant.price_range} variant="priceRange" />
              ) : null}
            </View>

            {restaurant.address_street ? (
              <View style={styles.addressRow}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.addressText} numberOfLines={1}>
                  {restaurant.address_street}
                </Text>
              </View>
            ) : null}

            {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 ? (
              <View style={styles.cuisineRow}>
                {restaurant.cuisine_types.map((cuisine) => (
                  <BadgePill key={cuisine} label={cuisineName(cuisine)} variant="cuisine" />
                ))}
              </View>
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.actionsRow}
            >
              {visibleActions.map((action) => (
                <Pressable
                  key={action.label}
                  onPress={action.onPress}
                  style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
                >
                  <MaterialCommunityIcons name={action.icon} size={22} color={colors.primary} />
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </BottomSheetScrollView>
        ) : null}
      </BottomSheet>
    );
  }
);

RestaurantBottomSheet.displayName = 'RestaurantBottomSheet';

function openTel(phone: string): void {
  const normalized = phone.replace(/\s/g, '');
  Linking.openURL(`tel:${normalized}`).catch(() => undefined);
}

function openExternalUrl(url: string): void {
  const trimmed = url.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  Linking.openURL(withProtocol).catch(() => undefined);
}

function openMaps(lat: number, lng: number): void {
  const url =
    Platform.OS === 'ios' ? `maps:?ll=${lat},${lng}` : `geo:${lat},${lng}?q=${lat},${lng}`;
  Linking.openURL(url).catch(() => undefined);
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.background,
  },
  handleIndicator: {
    backgroundColor: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.sectionGap,
  },
  header: {
    paddingBottom: spacing.md,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  location: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.cardPadding,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.cardPadding,
  },
  addressText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textSecondary,
  },
  cuisineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  actionsRow: {
    gap: spacing.cardPadding,
    paddingTop: spacing.sm,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  actionPressed: {
    opacity: 0.85,
  },
  actionLabel: {
    ...typography.tabLabel,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default RestaurantBottomSheet;

// i18n-migrated
