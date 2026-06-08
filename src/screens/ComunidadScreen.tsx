import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import RestaurantCard from '../components/RestaurantCard';
import { useRestaurants } from '../hooks/useRestaurants';
import type { ComunidadStackParamList } from '../navigation/ComunidadStack';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';
import { reportErrorViaEmail } from '../utils/submitViaEmail';

type ComunidadNavigationProp = NativeStackNavigationProp<ComunidadStackParamList, 'ComunidadMain'>;

const RECENT_LIMIT = 6;

export function ComunidadScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ComunidadNavigationProp>();
  const styles = useThemedStyles(createStyles);
  const { restaurants } = useRestaurants();

  const stats = useMemo(() => {
    const cities = new Set<string>();
    const countries = new Set<string>();
    for (const r of restaurants) {
      if (r.city) {
        cities.add(r.city.trim().toLowerCase());
      }
      if (r.country_code) {
        countries.add(r.country_code);
      }
    }
    return {
      restaurants: restaurants.length,
      cities: cities.size,
      countries: countries.size,
    };
  }, [restaurants]);

  const recent = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (b.last_verified_at ?? '').localeCompare(a.last_verified_at ?? ''))
      .slice(0, RECENT_LIMIT);
  }, [restaurants]);

  const openDetail = useCallback(
    (restaurantId: string) => navigation.navigate('RestaurantDetail', { restaurantId }),
    [navigation]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('community.title')}</Text>
          <Text style={styles.intro}>{t('community.intro')}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard value={stats.restaurants} label={t('community.stat_restaurants')} icon="silverware-fork-knife" />
          <StatCard value={stats.cities} label={t('community.stat_cities')} icon="city-variant-outline" />
          <StatCard value={stats.countries} label={t('community.stat_countries')} icon="earth" />
        </View>

        <ActionCard
          icon="store-plus-outline"
          title={t('community.cta_suggest_title')}
          description={t('community.cta_suggest_desc')}
          onPress={() => navigation.navigate('SubmitRestaurant')}
        />
        <ActionCard
          icon="alert-circle-outline"
          title={t('community.cta_report_title')}
          description={t('community.cta_report_desc')}
          onPress={() => {
            reportErrorViaEmail();
          }}
        />

        {recent.length > 0 ? (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>{t('community.recent_title')}</Text>
            {recent.map((item: Restaurant) => (
              <RestaurantCard
                key={item.id}
                restaurant={item}
                onPress={() => openDetail(item.id)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

function StatCard({ value, label, icon }: StatCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

interface ActionCardProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description: string;
  onPress: () => void;
}

function ActionCard({ icon, title, description, onPress }: ActionCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.actionCard, pressed && styles.actionPressed]}
    >
      <View style={styles.actionIcon}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.actionTextWrap}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
    </Pressable>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.sectionGap,
    gap: spacing.md,
  },
  header: {
    paddingTop: spacing.cardPadding,
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  intro: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.cardPadding,
    paddingHorizontal: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.cardPadding,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
  },
  actionPressed: {
    opacity: 0.85,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  actionTextWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  actionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  actionDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  recentSection: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
});
