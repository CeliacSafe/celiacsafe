import * as Application from 'expo-application';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Disclaimer from '../components/Disclaimer';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ProfileMenuCard from '../components/ProfileMenuCard';
import ProfileMenuRow, { ProfileMenuStaticRow } from '../components/ProfileMenuRow';
import ProfileSection from '../components/ProfileSection';
import RateAppButton from '../components/RateAppButton';
import ShareAppButton from '../components/ShareAppButton';
import { BUG_REPORT_EMAIL_SUBJECT, CONTACT_EMAIL, ERRORS_EMAIL } from '../constants/appContact';
import type { PerfilStackParamList } from '../navigation/PerfilStack';
import { colors } from '../theme/colors';
import { SPACE_SM, SPACE_XL, SPACE_XXL } from '../theme/spacing';
import { openEmail } from '../utils/openExternalUrl';

type PerfilNavigationProp = NativeStackNavigationProp<PerfilStackParamList, 'PerfilMain'>;

function PerfilScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<PerfilNavigationProp>();
  const appVersion = Application.nativeApplicationVersion ?? '1.0.0';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile.title')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileSection title={t('profile.language')}>
          <View style={styles.languageCardWrap}>
            <LanguageSwitcher variant="full" />
          </View>
        </ProfileSection>

        <ProfileSection title={t('profile.section_contribute')}>
          <ProfileMenuCard>
            <ProfileMenuRow
              icon="food-fork-drink"
              label={t('profile.submit_restaurant')}
              onPress={() => navigation.navigate('SubmitRestaurant')}
            />
            <ProfileMenuRow
              icon="alert-circle-outline"
              label={t('profile.report_error')}
              onPress={() => openEmail(ERRORS_EMAIL, BUG_REPORT_EMAIL_SUBJECT)}
            />
          </ProfileMenuCard>
        </ProfileSection>

        <ProfileSection title={t('profile.section_about')}>
          <ProfileMenuCard>
            <ProfileMenuRow
              icon="information-outline"
              label={t('profile.about')}
              onPress={() => navigation.navigate('About')}
            />
            <ProfileMenuStaticRow
              icon="cellphone"
              label={t('profile.version', { version: appVersion })}
            />
          </ProfileMenuCard>
        </ProfileSection>

        <ProfileSection title={t('profile.section_legal')}>
          <ProfileMenuCard>
            <ProfileMenuRow
              icon="shield-account-outline"
              label={t('profile.privacy')}
              onPress={() => navigation.navigate('Privacy')}
            />
            <ProfileMenuRow
              icon="text-box-outline"
              label={t('profile.impressum')}
              onPress={() => navigation.navigate('Impressum')}
            />
          </ProfileMenuCard>
          <View style={styles.disclaimerWrap}>
            <Disclaimer variant="full" embedded />
          </View>
        </ProfileSection>

        <ProfileSection title={t('profile.section_rate_share')}>
          <ProfileMenuCard>
            <RateAppButton variant="plain" />
            <ShareAppButton variant="plain" />
            <ProfileMenuRow
              icon="email-outline"
              label={t('profile.contact')}
              onPress={() => openEmail(CONTACT_EMAIL)}
            />
          </ProfileMenuCard>
        </ProfileSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: SPACE_XL,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACE_XXL,
  },
  languageCardWrap: {
    marginHorizontal: SPACE_XL,
    marginVertical: SPACE_SM,
  },
  disclaimerWrap: {
    marginHorizontal: SPACE_XL,
    marginTop: SPACE_SM,
    marginBottom: SPACE_SM,
  },
});

export default PerfilScreen;
