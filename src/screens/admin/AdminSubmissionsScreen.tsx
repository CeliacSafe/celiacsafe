import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import AdminScreenLayout from '../../components/AdminScreenLayout';
import type { PerfilStackParamList } from '../../navigation/PerfilStack';
import { useAdminStore } from '../../store/adminStore';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { RestaurantSubmission } from '../../types/Submission';
import { hapticLight } from '../../utils/haptics';

type Nav = NativeStackNavigationProp<PerfilStackParamList, 'AdminSubmissions'>;

function statusColor(status: RestaurantSubmission['status']) {
  switch (status) {
    case 'pending':
      return colors.warning;
    case 'in_review':
      return colors.primary;
    case 'promoted':
      return colors.verifiedGreen;
    case 'rejected':
      return colors.heart;
  }
}

export default function AdminSubmissionsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const submissions = useAdminStore((s) => s.submissions);
  const updateSubmissionStatus = useAdminStore((s) => s.updateSubmissionStatus);
  const promoteSubmission = useAdminStore((s) => s.promoteSubmission);

  return (
    <AdminScreenLayout title={t('admin.submissions_title')}>
      <FlatList
        data={submissions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('admin.submissions_empty')}</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.restaurantName}</Text>
              <Text style={[styles.status, { color: statusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.meta}>
              {item.city} · {item.source} · {new Date(item.submittedAt).toLocaleDateString('de-DE')}
            </Text>
            {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
            {item.submittedByEmail ? (
              <Text style={styles.meta}>{item.submittedByEmail}</Text>
            ) : null}

            {item.status !== 'promoted' && item.status !== 'rejected' ? (
              <View style={styles.actions}>
                <Pressable
                  onPress={() => {
                    hapticLight();
                    navigation.navigate('AdminRestaurantEdit', { submissionId: item.id });
                  }}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionPrimary}>{t('admin.review_create')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    hapticLight();
                    promoteSubmission(item.id);
                  }}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionSecondary}>{t('admin.quick_promote')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    hapticLight();
                    updateSubmissionStatus(item.id, 'rejected');
                  }}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionDanger}>{t('admin.reject')}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
      />
    </AdminScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.sectionGap,
    gap: spacing.sm,
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  status: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notes: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.cuisineSurface,
  },
  actionPrimary: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  actionSecondary: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionDanger: {
    ...typography.caption,
    color: colors.heart,
    fontWeight: '600',
  },
});
