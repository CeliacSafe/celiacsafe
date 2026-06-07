import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import AddressSection from '../components/AddressSection';
import ContactDetailsSection from '../components/ContactDetailsSection';
import CuisineTagsRow from '../components/CuisineTagsRow';
import DeliveryButtons from '../components/DeliveryButtons';
import DescriptionBlock from '../components/DescriptionBlock';
import DetailHeader from '../components/DetailHeader';
import Disclaimer from '../components/Disclaimer';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import OpeningHours from '../components/OpeningHours';
import QuickActionsBar from '../components/QuickActionsBar';
import ReservationSection from '../components/ReservationSection';
import SeasonalClosureBanner from '../components/SeasonalClosureBanner';
import VerificationSection from '../components/VerificationSection';
import { useRestaurantById } from '../hooks/useRestaurants';
import type { BuscarStackParamList } from '../navigation/BuscarStack';
import type { ComunidadStackParamList } from '../navigation/ComunidadStack';
import type { FavoritosStackParamList } from '../navigation/FavoritosStack';
import type { MapaStackParamList } from '../navigation/MapaStack';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<
  BuscarStackParamList | MapaStackParamList | FavoritosStackParamList | ComunidadStackParamList,
  'RestaurantDetail'
>;

export default function DetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { restaurantId } = route.params;
  const { restaurant, loading } = useRestaurantById(restaurantId);

  if (loading && !restaurant) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner fullscreen message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState
          illustration="default"
          iconName="food-off"
          title={t('detail.not_found_title')}
          description={t('detail.not_found_description')}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DetailHeader restaurant={restaurant} onBack={() => navigation.goBack()} />
        <QuickActionsBar restaurant={restaurant} />
        <VerificationSection restaurant={restaurant} />
        <AddressSection restaurant={restaurant} />
        <SeasonalClosureBanner restaurant={restaurant} />
        <CuisineTagsRow restaurant={restaurant} />
        <DescriptionBlock restaurant={restaurant} />
        <OpeningHours restaurant={restaurant} />
        <DeliveryButtons restaurant={restaurant} />
        <ReservationSection restaurant={restaurant} />
        <ContactDetailsSection restaurant={restaurant} />
        <Disclaimer variant="full" />
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

// i18n-migrated
