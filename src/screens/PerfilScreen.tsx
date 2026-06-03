import Constants from 'expo-constants';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Disclaimer from '../components/Disclaimer';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { colors } from '../theme/colors';
import { SPACE_LG, SPACE_MD, SPACE_XL, SPACE_XXL } from '../theme/spacing';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

interface ProfileSectionProps {
  title: string;
  children: ReactNode;
}

function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function PerfilScreen() {
  const { t } = useTranslation();

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
          <LanguageSwitcher variant="full" />
        </ProfileSection>

        <ProfileSection title={t('profile.about')}>
          <View style={styles.sectionCard}>
            <Text style={styles.versionText}>{t('profile.version', { version: APP_VERSION })}</Text>

            <View style={styles.divider} />

            <Pressable style={styles.menuRow} disabled accessibilityState={{ disabled: true }}>
              <Text style={styles.menuLabelDisabled}>{t('profile.contact')}</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.menuRow} disabled accessibilityState={{ disabled: true }}>
              <Text style={styles.menuLabelDisabled}>{t('profile.privacy')}</Text>
            </Pressable>
          </View>
        </ProfileSection>

        <ProfileSection title={t('profile.legal')}>
          <Disclaimer variant="full" embedded />
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
    paddingTop: SPACE_MD,
    paddingBottom: SPACE_LG,
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
    paddingHorizontal: SPACE_XL,
    paddingBottom: SPACE_XXL,
  },
  section: {
    marginBottom: SPACE_MD,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  versionText: {
    paddingVertical: 14,
    paddingHorizontal: SPACE_XL,
    color: colors.textSecondary,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background,
  },
  menuRow: {
    paddingVertical: 14,
    paddingHorizontal: SPACE_XL,
  },
  menuLabelDisabled: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.5,
  },
});

export default PerfilScreen;

// i18n-migrated
