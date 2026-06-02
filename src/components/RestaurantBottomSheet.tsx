/**
 * Bottom-Sheet mit Restaurant-Vorschau und Schnellaktionen nach Marker-Tap auf der Karte.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BadgePill from './BadgePill';
import { colors } from '../theme/colors';
import { RADIUS_BUTTON } from '../theme/radii';
import { SPACE_LG, SPACE_MD, SPACE_SM, SPACE_XL, SPACE_XS, SPACE_XXL } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

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

    const actions: ActionItem[] = restaurant
      ? [
          {
            icon: 'phone',
            label: 'Anrufen',
            visible: Boolean(restaurant.phone),
            onPress: () => openTel(restaurant.phone!),
          },
          {
            icon: 'web',
            label: 'Website',
            visible: Boolean(restaurant.website),
            onPress: () => openUrl(restaurant.website!),
          },
          {
            icon: 'map',
            label: 'Route',
            visible: restaurant.latitude != null && restaurant.longitude != null,
            onPress: () => openMaps(restaurant.latitude!, restaurant.longitude!),
          },
          {
            icon: 'information',
            label: 'Detalle',
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
                {restaurant.city} · {restaurant.region_name}
              </Text>
            </View>

            <View style={styles.badgeRow}>
              <BadgePill label="100% SIN GLUTEN" variant="sinGluten" iconName="check-circle" />
              {showVerificationBadge ? (
                <BadgePill
                  label="VERIFICACIÓN OFICIAL"
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
                  <BadgePill key={cuisine} label={cuisine} variant="cuisine" />
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

function openUrl(url: string): void {
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
    paddingHorizontal: SPACE_XL,
    paddingBottom: SPACE_XXL,
  },
  header: {
    paddingBottom: SPACE_LG,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  location: {
    marginTop: SPACE_XS,
    color: colors.textSecondary,
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACE_SM - 2,
    marginBottom: SPACE_MD,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_SM,
    marginBottom: SPACE_MD,
  },
  addressText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
  },
  cuisineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACE_SM - 2,
    marginBottom: SPACE_LG,
  },
  actionsRow: {
    gap: SPACE_MD,
    paddingTop: SPACE_SM,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: RADIUS_BUTTON,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACE_XS,
  },
  actionPressed: {
    opacity: 0.85,
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
});

export default RestaurantBottomSheet;
