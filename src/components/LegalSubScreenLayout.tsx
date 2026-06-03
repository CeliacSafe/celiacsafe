import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';

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
    paddingHorizontal: spacing.cardPadding,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.overlayWhite15,
  },
  backButton: {
    padding: spacing.sm,
  },
  backPressed: {
    opacity: 0.6,
  },
  headerTitle: {
    ...typography.h4,
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sectionGap,
    gap: spacing.screenPadding,
  },
  updated: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  translationNoticeBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: spacing.md,
  },
  translationNoticeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  block: {
    gap: spacing.md,
  },
  heading: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary,
  },
  body: {
    ...typography.body,
    color: colors.textPrimary,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.cardPadding,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  noticeIcon: {
    marginTop: 2,
  },
  noticeText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textPrimary,
  },
});
