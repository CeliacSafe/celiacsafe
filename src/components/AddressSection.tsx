import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import AddressMapPreview from './AddressMapPreview';
import { useLocalized } from '../hooks/useLocalized';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';
import { canOpenExternalMaps, openMapsPlace } from '../utils/mapsPlaceLinks';

interface AddressSectionProps {
  restaurant: Restaurant;
}

function formatAddress(restaurant: Restaurant, regionLabel: string): string {
  const parts: string[] = [];
  if (restaurant.address_street) {
    parts.push(restaurant.address_street);
  }
  const cityLine = [restaurant.postal_code, restaurant.city].filter(Boolean).join(' ');
  if (cityLine) {
    parts.push(cityLine);
  }
  if (regionLabel) {
    parts.push(regionLabel);
  }
  return parts.join(', ');
}

/**
 * Adresse mit Mini-Map und Routing-Button fuer die Detail-Seite.
 */
function AddressSection({ restaurant }: AddressSectionProps) {
  const { t } = useTranslation();
  const { regionName } = useLocalized();
  const regionLabel = regionName(restaurant.region_code);
  const addressText = formatAddress(restaurant, regionLabel);
  const hasCoordinates = restaurant.latitude != null && restaurant.longitude != null;

  if (!addressText && !hasCoordinates) {
    return null;
  }

  const handleOpenMaps = () => {
    openMapsPlace(restaurant);
  };

  const showMapsButton = canOpenExternalMaps(restaurant);

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
        <Text style={styles.title}>{t('detail.address')}</Text>
      </View>

      {addressText ? <Text style={styles.addressText}>{addressText}</Text> : null}

      {hasCoordinates ? (
        <View style={styles.mapWrap}>
          <AddressMapPreview restaurant={restaurant} onPress={handleOpenMaps} />
        </View>
      ) : null}

      {showMapsButton ? (
        <Pressable
          onPress={handleOpenMaps}
          android_ripple={{ color: colors.rippleLight }}
          style={({ pressed }) => [styles.routeButton, pressed && styles.routePressed]}
        >
          <Text style={styles.routeLabel}>{t('detail.open_in_maps')}</Text>
        </Pressable>
      ) : null}
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
  addressText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.cardPadding,
  },
  mapWrap: {
    marginBottom: spacing.cardPadding,
  },
  routeButton: {
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: 'center',
    overflow: 'hidden',
  },
  routePressed: {
    opacity: 0.9,
  },
  routeLabel: {
    ...typography.button,
    fontWeight: '700',
    color: colors.background,
  },
});

export default AddressSection;

// i18n-migrated
