import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import FilterChipRow from './FilterChipRow';
import { QUICK_FILTER_IDS, type QuickFilterId } from '../data/filterOptions';
import { useFilterStore } from '../store/filterStore';
import { spacing } from '../theme/spacing';

const QUICK_FILTER_I18N: Record<QuickFilterId, string> = {
  all: 'filter.quick_chip_all',
  lactose_free: 'filter.quick_chip_lactose_free',
  pastry_shop: 'filter.quick_chip_pastry',
  pizzeria: 'filter.quick_chip_pizza',
  vegan: 'filter.quick_chip_vegan',
};

function SearchQuickFilterChips() {
  const { t } = useTranslation();
  const dietLactoseFree = useFilterStore((s) => s.dietLactoseFree);
  const dietVegan = useFilterStore((s) => s.dietVegan);
  const selectedVenueTypes = useFilterStore((s) => s.selectedVenueTypes);
  const setQuickFilter = useFilterStore((s) => s.setQuickFilter);

  const selectedId = useMemo((): QuickFilterId => {
    if (dietLactoseFree) return 'lactose_free';
    if (dietVegan) return 'vegan';
    if (selectedVenueTypes.length === 1 && selectedVenueTypes[0] === 'pastry_shop') {
      return 'pastry_shop';
    }
    if (selectedVenueTypes.length === 1 && selectedVenueTypes[0] === 'pizzeria') {
      return 'pizzeria';
    }
    return 'all';
  }, [dietLactoseFree, dietVegan, selectedVenueTypes]);

  const chips = useMemo(
    () =>
      QUICK_FILTER_IDS.map((id) => ({
        id,
        label: t(QUICK_FILTER_I18N[id]),
      })),
    [t]
  );

  return (
    <View style={styles.wrap}>
      <FilterChipRow
        options={chips}
        selectedId={selectedId}
        onSelect={(id) => setQuickFilter(id as QuickFilterId)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.sm,
  },
});

export default SearchQuickFilterChips;
