import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import GlutenFreeLogo from '../components/GlutenFreeLogo';
import LegalSubScreenLayout, { LegalSectionBlock } from '../components/LegalSubScreenLayout';
import { BUG_REPORT_EMAIL_SUBJECT, CONTACT_EMAIL, ERRORS_EMAIL } from '../constants/appContact';
import { getPlatformStoreUrl } from '../constants/storeUrls';
import type { PerfilStackParamList } from '../navigation/PerfilStack';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import { openEmail } from '../utils/openExternalUrl';
import { requestAppStoreReview } from '../utils/rateApp';

type AboutNavigationProp = NativeStackNavigationProp<PerfilStackParamList, 'About'>;

type HelpIconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface HelpAction {
  icon: HelpIconName;
  label: string;
  onPress: () => void;
}

function AboutScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<AboutNavigationProp>();
  const appVersion = Application.nativeApplicationVersion ?? '1.0.0';

  const handleShare = useCallback(async () => {
    const url = getPlatformStoreUrl();
    const message = t('about.share_message', { url });
    if (Platform.OS === 'ios') {
      await Share.share({ message, url });
    } else {
      await Share.share({ message });
    }
  }, [t]);

  const helpActions: HelpAction[] = useMemo(
    () => [
      {
        icon: 'store-plus-outline',
        label: t('about.help_link_suggest'),
        onPress: () => navigation.navigate('SubmitRestaurant'),
      },
      {
        icon: 'alert-circle-outline',
        label: t('about.help_link_report'),
        onPress: () => openEmail(ERRORS_EMAIL, BUG_REPORT_EMAIL_SUBJECT),
      },
      {
        icon: 'email-outline',
        label: t('about.help_link_contact'),
        onPress: () => openEmail(CONTACT_EMAIL),
      },
      {
        icon: 'shield-account-outline',
        label: t('about.help_link_privacy'),
        onPress: () => navigation.navigate('Privacy'),
      },
      {
        icon: 'star-outline',
        label: t('about.help_link_rate'),
        onPress: () => {
          requestAppStoreReview().catch(() => undefined);
        },
      },
      {
        icon: 'share-variant-outline',
        label: t('about.help_link_share'),
        onPress: () => {
          handleShare().catch(() => undefined);
        },
      },
    ],
    [handleShare, navigation, t]
  );

  const contentSections = useMemo(
    () => [
      { title: t('about.mission_title'), body: t('about.mission_body') },
      { title: t('about.verification_title'), body: t('about.verification_body') },
      { title: t('about.noncommercial_title'), body: t('about.noncommercial_body') },
      { title: t('about.maker_title'), body: t('about.maker_body') },
    ],
    [t]
  );

  return (
    <LegalSubScreenLayout title={t('about.title')}>
      <View style={styles.hero}>
        <GlutenFreeLogo size={88} style={styles.logo} />
        <Text style={styles.heroTitle}>{t('about.brand_name')}</Text>
        <Text style={styles.heroSubtitle}>{t('about.hero_subtitle')}</Text>
      </View>

      {contentSections.map((section) => (
        <LegalSectionBlock key={section.title} title={section.title} body={section.body} />
      ))}

      <View style={styles.helpBlock}>
        <Text style={styles.helpHeading}>{t('about.help_title')}</Text>
        <View style={styles.helpCard}>
          {helpActions.map((action, index) => (
            <View key={action.label}>
              <Pressable
                onPress={action.onPress}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                style={({ pressed }) => [styles.helpRow, pressed && styles.helpRowPressed]}
              >
                <MaterialCommunityIcons name={action.icon} size={22} color={colors.primary} />
                <Text style={styles.helpLabel}>{action.label}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
              {index < helpActions.length - 1 ? <View style={styles.helpDivider} /> : null}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.versionBox}>
        <MaterialCommunityIcons name="cellphone" size={22} color={colors.primary} />
        <Text style={styles.versionText}>{t('about.version_label', { version: appVersion })}</Text>
      </View>
    </LegalSubScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: radius.icon,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.primary,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.cardPadding,
  },
  helpBlock: {
    gap: spacing.md,
  },
  helpHeading: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary,
  },
  helpCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.cardPadding,
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
  },
  helpRowPressed: {
    opacity: 0.85,
  },
  helpLabel: {
    ...typography.h4,
    flex: 1,
    color: colors.textPrimary,
  },
  helpDivider: {
    height: 1,
    backgroundColor: colors.background,
  },
  versionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.cardPadding,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    marginTop: spacing.sm,
  },
  versionText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default AboutScreen;
