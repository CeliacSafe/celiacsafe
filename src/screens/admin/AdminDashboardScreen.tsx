import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import AdminScreenLayout from '../../components/AdminScreenLayout';
import type { PerfilStackParamList } from '../../navigation/PerfilStack';
import { useAdminStore } from '../../store/adminStore';
import { useTheme } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { type AppColors } from '../../theme/palette';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { getMergedRestaurants } from '../../utils/restaurantDataService';
import { restaurantsToCsv } from '../../utils/adminCsv';
import { shareTextAsFile } from '../../utils/shareCsvFile';
import { hapticLight } from '../../utils/haptics';

type Nav = NativeStackNavigationProp<PerfilStackParamList, 'AdminDashboard'>;

interface MenuItem {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  badge?: number;
  route: keyof Pick<
    PerfilStackParamList,
    'AdminRestaurants' | 'AdminSubmissions' | 'AdminImport'
  >;
}

export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const logout = useAdminStore((s) => s.logout);
  const pendingCount = useAdminStore((s) => s.getPendingSubmissionCount());
  const exportSubmissionsCsv = useAdminStore((s) => s.exportSubmissionsCsv);

  const items: MenuItem[] = [
    {
      icon: 'silverware-fork-knife',
      title: t('admin.menu_restaurants'),
      subtitle: t('admin.menu_restaurants_hint'),
      route: 'AdminRestaurants',
    },
    {
      icon: 'inbox-arrow-down',
      title: t('admin.menu_submissions'),
      subtitle: t('admin.menu_submissions_hint'),
      badge: pendingCount,
      route: 'AdminSubmissions',
    },
    {
      icon: 'file-upload-outline',
      title: t('admin.menu_import'),
      subtitle: t('admin.menu_import_hint'),
      route: 'AdminImport',
    },
  ];

  const handleExportRestaurants = async () => {
    hapticLight();
    const csv = restaurantsToCsv(getMergedRestaurants({ includeUnverified: true }));
    await shareTextAsFile(csv, `celiacsafe-restaurants-${Date.now()}.csv`);
  };

  const handleExportSubmissions = async () => {
    hapticLight();
    const csv = exportSubmissionsCsv();
    await shareTextAsFile(csv, `celiacsafe-submissions-${Date.now()}.csv`);
  };

  return (
    <AdminScreenLayout
      title={t('admin.dashboard_title')}
      rightAction={
        <Pressable onPress={logout} hitSlop={8}>
          <MaterialCommunityIcons name="logout" size={22} color={colors.heart} />
        </Pressable>
      }
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>{t('admin.dashboard_intro')}</Text>

        {items.map((item) => (
          <Pressable
            key={item.route}
            onPress={() => {
              hapticLight();
              navigation.navigate(item.route);
            }}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <MaterialCommunityIcons name={item.icon} size={28} color={colors.primary} />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            {item.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            ) : null}
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </Pressable>
        ))}

        <Text style={styles.section}>{t('admin.export_section')}</Text>
        <Pressable onPress={handleExportRestaurants} style={styles.exportButton}>
          <MaterialCommunityIcons name="export" size={20} color={colors.primary} />
          <Text style={styles.exportLabel}>{t('admin.export_restaurants')}</Text>
        </Pressable>
        <Pressable onPress={handleExportSubmissions} style={styles.exportButton}>
          <MaterialCommunityIcons name="export" size={20} color={colors.primary} />
          <Text style={styles.exportLabel}>{t('admin.export_submissions')}</Text>
        </Pressable>

        <Text style={styles.footerNote}>{t('admin.offline_note')}</Text>
      </ScrollView>
    </AdminScreenLayout>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  content: {
    padding: spacing.screenPadding,
    gap: spacing.sm,
    paddingBottom: spacing.sectionGap,
  },
  intro: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.cardPadding,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    marginBottom: spacing.sm,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.heart,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  section: {
    ...typography.overline,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.cardPadding,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  exportLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
