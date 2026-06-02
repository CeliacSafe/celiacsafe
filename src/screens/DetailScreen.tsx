import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BadgePill from '../components/BadgePill';
import { getRestaurantById } from '../hooks/useRestaurants';
import type { BuscarStackParamList } from '../navigation/BuscarStack';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<BuscarStackParamList, 'RestaurantDetail'>;

export default function DetailScreen({ route }: Props) {
  const { restaurantId } = route.params;
  const restaurant = getRestaurantById(restaurantId);

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Restaurant nicht gefunden</Text>
      </View>
    );
  }

  const showVerificationBadge =
    restaurant.face_program === true || restaurant.aoecs_certified === true;
  const address = restaurant.address_street
    ? `${restaurant.address_street}, ${restaurant.city}`
    : restaurant.city;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Kopfbereich */}
      <Text style={styles.name}>{restaurant.name}</Text>
      <Text style={styles.regionCity}>
        {restaurant.city} · {restaurant.region_name}
      </Text>

      {/* Verifizierungs-Badges */}
      <View style={styles.badgeRow}>
        <BadgePill label="100% SIN GLUTEN" variant="sinGluten" iconName="check-circle" />
        {showVerificationBadge ? (
          <BadgePill label="VERIFICACIÓN OFICIAL" variant="verified" iconName="shield-check" />
        ) : null}
      </View>

      {/* Adresse */}
      <Text style={styles.sectionLabel}>Adresse</Text>
      <Text style={styles.bodyText}>{address}</Text>

      {/* Cuisine-Tags */}
      {restaurant.cuisine_types?.length ? (
        <>
          <Text style={styles.sectionLabel}>Küche</Text>
          <View style={styles.tagsRow}>
            {restaurant.cuisine_types.map((cuisine) => (
              <BadgePill key={cuisine} label={cuisine} variant="cuisine" />
            ))}
          </View>
        </>
      ) : null}

      {/* Kontaktvorschau */}
      {restaurant.phone ? (
        <>
          <Text style={styles.sectionLabel}>Telefon</Text>
          <Text style={styles.bodyText}>{restaurant.phone}</Text>
        </>
      ) : null}
      {restaurant.website ? (
        <>
          <Text style={styles.sectionLabel}>Website</Text>
          <Text style={styles.bodyText}>{restaurant.website}</Text>
        </>
      ) : null}

      {/* Beschreibung */}
      {restaurant.description_es ? (
        <>
          <Text style={styles.sectionLabel}>Beschreibung</Text>
          <Text style={styles.bodyText}>{restaurant.description_es}</Text>
        </>
      ) : null}

      <Text style={styles.hint}>
        Volle Detail-Ansicht mit Karten-Mini, Lieferdiensten und Reservierung kommt in M06.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  error: {
    color: colors.heart,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  regionCity: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 16,
  },
  badgeRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionLabel: {
    marginTop: 18,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  bodyText: {
    marginTop: 6,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  tagsRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hint: {
    marginTop: 32,
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
