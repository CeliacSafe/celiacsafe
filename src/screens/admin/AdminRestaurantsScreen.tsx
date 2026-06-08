import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { hapticLight } from '../../utils/haptics';

type Nav = NativeStackNavigationProp<PerfilStackParamList, 'AdminRestaurants'>;

export default function AdminRestaurantsScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const dataRevision = useAdminStore((s) => s.dataRevision);
  const [query, setQuery] = useState('');

  const restaurants = useMemo(() => getMergedRestaurants(), [dataRevision]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [restaurants, query]);

  return (
    <AdminScreenLayout
      title={t('admin.restaurants_title')}
      rightAction={
        <Pressable
          onPress={() => {
            hapticLight();
            navigation.navigate('AdminRestaurantEdit', {});
          }}
        >
          <Text style={styles.addLabel}>{t('admin.add')}</Text>
        </Pressable>
      }
    >
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.textSecondary}
          style={styles.search}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              hapticLight();
              navigation.navigate('AdminRestaurantEdit', { restaurantId: item.id });
            }}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.rowText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.city} · {item.id}
              </Text>
            </View>
            <Text style={styles.status}>{item.verification_status}</Text>
          </Pressable>
        )}
      />
    </AdminScreenLayout>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  searchWrap: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.sm,
  },
  search: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.cardPadding,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
  },
  list: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.sectionGap,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    marginBottom: spacing.sm,
  },
  rowPressed: {
    opacity: 0.9,
  },
  rowText: {
    flex: 1,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  status: {
    ...typography.caption,
    color: colors.primary,
  },
  addLabel: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
});
