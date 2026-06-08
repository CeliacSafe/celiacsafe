import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { SearchCategoryTab } from '../data/filterOptions';
import { useFilterStore } from '../store/filterStore';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { hapticLight } from '../utils/haptics';

const TABS: SearchCategoryTab[] = ['verified', 'community', 'bakery'];

function SearchCategoryTabs() {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const categoryTab = useFilterStore((s) => s.categoryTab);
  const setCategoryTab = useFilterStore((s) => s.setCategoryTab);

  const labelFor = (tab: SearchCategoryTab) => {
    switch (tab) {
      case 'verified':
        return t('filter.tab_verified');
      case 'community':
        return t('filter.tab_community');
      case 'bakery':
        return t('filter.tab_bakeries');
      default:
        return tab;
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {TABS.map((tab) => {
        const active = categoryTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => {
              hapticLight();
              setCategoryTab(tab);
            }}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{labelFor(tab)}</Text>
          </Pressable>
        );
      })}
      <View style={styles.trailing} />
    </ScrollView>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.onPrimary,
  },
  trailing: {
    width: spacing.xs,
  },
});

export default SearchCategoryTabs;
