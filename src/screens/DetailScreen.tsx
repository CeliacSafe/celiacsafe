import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import AddressSection from '../components/AddressSection';
import ContactDetailsSection from '../components/ContactDetailsSection';
import DeliveryButtons from '../components/DeliveryButtons';
import DescriptionBlock from '../components/DescriptionBlock';
import DetailBodyHeader from '../components/DetailBodyHeader';
import DetailHeader from '../components/DetailHeader';
import DetailPrimaryActions from '../components/DetailPrimaryActions';
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
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

type Props = NativeStackScreenProps<
  BuscarStackParamList | MapaStackParamList | FavoritosStackParamList | ComunidadStackParamList,
  'RestaurantDetail'
>;

export default function DetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
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

        <View style={styles.bodySheet}>
          <DetailBodyHeader restaurant={restaurant} />
          <DetailPrimaryActions restaurant={restaurant} />
          <QuickActionsBar restaurant={restaurant} layout="grid" omitKeys={['call', 'maps']} />
          <DescriptionBlock restaurant={restaurant} />
          <OpeningHours restaurant={restaurant} />
          <VerificationSection restaurant={restaurant} />
          <AddressSection restaurant={restaurant} />
          <SeasonalClosureBanner restaurant={restaurant} />
          <DeliveryButtons restaurant={restaurant} />
          <ReservationSection restaurant={restaurant} />
          <ContactDetailsSection restaurant={restaurant} />
          <Disclaimer variant="full" />
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.sectionGap,
  },
  bodySheet: {
    marginTop: -spacing.lg,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});

// i18n-migrated
