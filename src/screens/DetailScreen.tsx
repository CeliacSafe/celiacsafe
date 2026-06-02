import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AddressSection from '../components/AddressSection';
import ContactDetailsSection from '../components/ContactDetailsSection';
import CuisineTagsRow from '../components/CuisineTagsRow';
import DeliveryButtons from '../components/DeliveryButtons';
import DescriptionBlock from '../components/DescriptionBlock';
import DetailHeader from '../components/DetailHeader';
import Disclaimer from '../components/Disclaimer';
import EmptyState from '../components/EmptyState';
import OpeningHours from '../components/OpeningHours';
import QuickActionsBar from '../components/QuickActionsBar';
import ReservationSection from '../components/ReservationSection';
import SeasonalClosureBanner from '../components/SeasonalClosureBanner';
import VerificationSection from '../components/VerificationSection';
import { getRestaurantById } from '../hooks/useRestaurants';
import type { BuscarStackParamList } from '../navigation/BuscarStack';
import type { MapaStackParamList } from '../navigation/MapaStack';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<BuscarStackParamList | MapaStackParamList, 'RestaurantDetail'>;

export default function DetailScreen({ route, navigation }: Props) {
  const { restaurantId } = route.params;
  const restaurant = getRestaurantById(restaurantId);
  const language = 'es';
  // TODO M07: Lokaler isFavorite-State wird durch useFavoritesStore ersetzt
  const [isFavorite, setIsFavorite] = useState(false);

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <EmptyState
          iconName="food-off"
          title="Restaurant nicht gefunden"
          description="Este restaurante ya no esta disponible."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DetailHeader
          restaurant={restaurant}
          language={language}
          isFavorite={isFavorite}
          onToggleFavorite={() => setIsFavorite((prev) => !prev)}
          onBack={() => navigation.goBack()}
        />

        <QuickActionsBar restaurant={restaurant} language={language} />
        <VerificationSection restaurant={restaurant} language={language} />
        <AddressSection restaurant={restaurant} language={language} />
        <SeasonalClosureBanner restaurant={restaurant} language={language} />
        <CuisineTagsRow restaurant={restaurant} language={language} />
        <DescriptionBlock restaurant={restaurant} language={language} />
        <OpeningHours restaurant={restaurant} language={language} />
        <DeliveryButtons restaurant={restaurant} language={language} />
        <ReservationSection restaurant={restaurant} language={language} />
        <ContactDetailsSection restaurant={restaurant} language={language} />
        <Disclaimer variant="full" language={language} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
