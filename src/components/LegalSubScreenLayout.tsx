import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import { RADIUS_SUB } from '../theme/radii';
import { SPACE_LG, SPACE_MD, SPACE_SM, SPACE_XL, SPACE_XXL } from '../theme/spacing';

interface LegalSubScreenLayoutProps {
  title: string;
  lastUpdated?: string;
  /** Hinweis oben (z. B. Übersetzungsstatus Datenschutz EN/DE). */
  translationNotice?: string;
  children: ReactNode;
  notice?: string;
}

export default function LegalSubScreenLayout({
  title,
  lastUpdated,
  translationNotice,
  children,
  notice,
}: LegalSubScreenLayoutProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {lastUpdated ? <Text style={styles.updated}>{lastUpdated}</Text> : null}
        {translationNotice ? (
          <View style={styles.translationNoticeBox}>
            <Text style={styles.translationNoticeText}>{translationNotice}</Text>
          </View>
        ) : null}
        {children}
        {notice ? (
          <View style={styles.noticeBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={22}
              color={colors.primary}
              style={styles.noticeIcon}
            />
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export function LegalSectionBlock({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.block}>
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACE_MD,
    paddingVertical: SPACE_SM,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.overlayWhite15,
  },
  backButton: {
    padding: SPACE_SM,
  },
  backPressed: {
    opacity: 0.6,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACE_XL,
    paddingTop: SPACE_LG,
    paddingBottom: SPACE_XXL,
    gap: SPACE_XL,
  },
  updated: {
    color: colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  translationNoticeBox: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS_SUB,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: SPACE_LG,
  },
  translationNoticeText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  block: {
    gap: SPACE_LG,
  },
  heading: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACE_MD,
    backgroundColor: colors.surface,
    borderRadius: RADIUS_SUB,
    padding: SPACE_LG,
    marginTop: SPACE_SM,
  },
  noticeIcon: {
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
});
