import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import CustomMarker from './CustomMarker';
import type { AppLanguage } from '../i18n/getLocalizedName';
import { colors } from '../theme/colors';
import { RADIUS_INPUT } from '../theme/radii';
import { SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';
import { openMapsRouting } from '../utils/openExternalUrl';

interface AddressSectionProps {
  restaurant: Restaurant;
  language?: AppLanguage;
}

const SECTION_TITLES: Record<AppLanguage, string> = {
  es: 'Dirección',
  en: 'Address',
  de: 'Adresse',
};

const ROUTING_LABELS: Record<AppLanguage, string> = {
  es: 'Cómo llegar',
  en: 'Get directions',
  de: 'Route planen',
};

const MAP_DELTA = 0.005;

function formatAddress(restaurant: Restaurant): string {
  const parts: string[] = [];
  if (restaurant.address_street) {
    parts.push(restaurant.address_street);
  }
  const cityLine = [restaurant.postal_code, restaurant.city].filter(Boolean).join(' ');
  if (cityLine) {
    parts.push(cityLine);
  }
  if (restaurant.region_name) {
    parts.push(restaurant.region_name);
  }
  return parts.join(', ');
}

/**
 * Adresse mit Mini-Map und Routing-Button fuer die Detail-Seite.
 */
function AddressSection({ restaurant, language = 'es' }: AddressSectionProps) {
  const addressText = formatAddress(restaurant);
  const hasCoordinates = restaurant.latitude != null && restaurant.longitude != null;

  if (!addressText && !hasCoordinates) {
    return null;
  }

  const mapRegion = hasCoordinates
    ? {
        latitude: restaurant.latitude!,
        longitude: restaurant.longitude!,
        latitudeDelta: MAP_DELTA,
        longitudeDelta: MAP_DELTA,
      }
    : null;

  const handleRouting = () => {
    if (hasCoordinates) {
      openMapsRouting(restaurant.latitude!, restaurant.longitude!, restaurant.name);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
        <Text style={styles.title}>{SECTION_TITLES[language]}</Text>
      </View>

      {addressText ? <Text style={styles.addressText}>{addressText}</Text> : null}

      {mapRegion ? (
        <Pressable onPress={handleRouting} style={styles.mapPressable}>
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.miniMap}
            region={mapRegion}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            pointerEvents="none"
          >
            <Marker
              coordinate={{
                latitude: restaurant.latitude!,
                longitude: restaurant.longitude!,
              }}
              tracksViewChanges={false}
            >
              <CustomMarker />
            </Marker>
          </MapView>
        </Pressable>
      ) : null}

      {hasCoordinates ? (
        <Pressable
          onPress={handleRouting}
          android_ripple={{ color: colors.rippleLight }}
          style={({ pressed }) => [styles.routeButton, pressed && styles.routePressed]}
        >
          <Text style={styles.routeLabel}>{ROUTING_LABELS[language]}</Text>
        </Pressable>
      ) : null}
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
  addressText: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SPACE_MD,
  },
  mapPressable: {
    borderRadius: RADIUS_INPUT,
    overflow: 'hidden',
    marginBottom: SPACE_MD,
  },
  miniMap: {
    width: '100%',
    height: 180,
  },
  routeButton: {
    borderRadius: RADIUS_INPUT,
    backgroundColor: colors.primary,
    paddingVertical: SPACE_MD + 2,
    alignItems: 'center',
    overflow: 'hidden',
  },
  routePressed: {
    opacity: 0.9,
  },
  routeLabel: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AddressSection;
