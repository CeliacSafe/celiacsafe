import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import AdminScreenLayout from '../../components/AdminScreenLayout';
import type { PerfilStackParamList } from '../../navigation/PerfilStack';
import { useAdminStore } from '../../store/adminStore';
import { useTheme } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { type AppColors } from '../../theme/palette';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { CountryCode, RegionCode, Restaurant } from '../../types/Restaurant';
import { getMergedRestaurantById } from '../../utils/restaurantDataService';
import { hapticSuccess } from '../../utils/haptics';

type Nav = NativeStackNavigationProp<PerfilStackParamList, 'AdminRestaurantEdit'>;
type Route = RouteProp<PerfilStackParamList, 'AdminRestaurantEdit'>;

function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
}

export default function AdminRestaurantEditScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const upsertRestaurant = useAdminStore((s) => s.upsertRestaurant);
  const hideRestaurant = useAdminStore((s) => s.hideRestaurant);
  const updateSubmissionStatus = useAdminStore((s) => s.updateSubmissionStatus);
  const submissions = useAdminStore((s) => s.submissions);

  const existing = route.params.restaurantId
    ? getMergedRestaurantById(route.params.restaurantId)
    : undefined;

  const fromSubmission = route.params.submissionId
    ? submissions.find((s) => s.id === route.params.submissionId)
    : undefined;

  const initial = useMemo((): Restaurant => {
    if (existing) return { ...existing };
    if (fromSubmission) {
      return {
        id: `es_admin_${Date.now()}`,
        name: fromSubmission.restaurantName,
        country_code: (fromSubmission.countryCode || 'ES') as CountryCode,
        region_code: 'ES-MD' as RegionCode,
        region_name: 'Comunidad de Madrid',
        city: fromSubmission.city,
        verification_status: 'to_be_verified',
        address_street: fromSubmission.address,
        website: fromSubmission.website,
        phone: fromSubmission.phone,
        description_es: fromSubmission.notes,
      };
    }
    return {
      id: `es_admin_${Date.now()}`,
      name: '',
      country_code: 'ES' as CountryCode,
      region_code: 'ES-IB' as RegionCode,
      region_name: 'Illes Balears',
      city: '',
      verification_status: 'to_be_verified',
    };
  }, [existing, fromSubmission]);

  const [form, setForm] = useState(initial);

  const setField = <K extends keyof Restaurant>(key: K, value: Restaurant[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.city.trim()) {
      Alert.alert(t('common.error'), t('admin.validation_required'));
      return;
    }
    upsertRestaurant({ ...form, name: form.name.trim(), city: form.city.trim() });
    if (route.params.submissionId) {
      updateSubmissionStatus(route.params.submissionId, 'promoted', {
        promotedToRestaurantId: form.id,
      });
    }
    hapticSuccess();
    navigation.goBack();
  };

  const handleHide = () => {
    Alert.alert(t('admin.hide_title'), t('admin.hide_message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('admin.hide_confirm'),
        style: 'destructive',
        onPress: () => {
          hideRestaurant(form.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <AdminScreenLayout title={existing ? t('admin.edit_restaurant') : t('admin.new_restaurant')}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="ID" value={form.id} onChangeText={(v) => setField('id', v)} />
        <Field label={t('submit.restaurant_name_label')} value={form.name} onChangeText={(v) => setField('name', v)} />
        <Field label={t('submit.city_label')} value={form.city} onChangeText={(v) => setField('city', v)} />
        <Field label="slug" value={form.slug ?? ''} onChangeText={(v) => setField('slug', v)} />
        <Field label="region_code" value={form.region_code} onChangeText={(v) => setField('region_code', v as Restaurant['region_code'])} />
        <Field label="region_name" value={form.region_name} onChangeText={(v) => setField('region_name', v)} />
        <Field
          label="verification_status"
          value={form.verification_status}
          onChangeText={(v) => setField('verification_status', v as Restaurant['verification_status'])}
        />
        <Field
          label="latitude"
          value={form.latitude != null ? String(form.latitude) : ''}
          onChangeText={(v) => setField('latitude', v ? Number.parseFloat(v) : undefined)}
        />
        <Field
          label="longitude"
          value={form.longitude != null ? String(form.longitude) : ''}
          onChangeText={(v) => setField('longitude', v ? Number.parseFloat(v) : undefined)}
        />
        <Field label={t('submit.address_label')} value={form.address_street ?? ''} onChangeText={(v) => setField('address_street', v)} />
        <Field label={t('submit.website_label')} value={form.website ?? ''} onChangeText={(v) => setField('website', v)} />
        <Field label={t('detail.menu')} value={form.menu_url ?? ''} onChangeText={(v) => setField('menu_url', v)} />
        <Field label={t('submit.contact_label')} value={form.phone ?? ''} onChangeText={(v) => setField('phone', v)} />
        <Field
          label={t('submit.notes_label')}
          value={form.description_es ?? ''}
          onChangeText={(v) => setField('description_es', v)}
          multiline
        />

        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveLabel}>{t('admin.save')}</Text>
        </Pressable>

        {existing ? (
          <Pressable onPress={handleHide} style={styles.hideButton}>
            <Text style={styles.hideLabel}>{t('admin.hide_restaurant')}</Text>
          </Pressable>
        ) : null}
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
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    color: colors.textPrimary,
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    paddingVertical: spacing.cardPadding,
    alignItems: 'center',
  },
  saveLabel: {
    ...typography.button,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  hideButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.cardPadding,
    alignItems: 'center',
  },
  hideLabel: {
    ...typography.body,
    color: colors.heart,
  },
});
