import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import LoadingSpinner from '../components/LoadingSpinner';
import type { PerfilStackParamList } from '../navigation/PerfilStack';
import { useAdminStore } from '../store/adminStore';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import { hapticSuccess } from '../utils/haptics';
import { submitRestaurantToSupabase } from '../utils/submitToSupabase';
import { submitRestaurantViaEmail } from '../utils/submitViaEmail';

type SubmitNavigationProp = NativeStackNavigationProp<PerfilStackParamList, 'SubmitRestaurant'>;

const MIN_TEXT_LENGTH = 2;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }
  return EMAIL_REGEX.test(trimmed);
}

function isValidWebsite(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return true;
  }
  return (
    trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('www.')
  );
}

function SubmitRestaurantScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<SubmitNavigationProp>();

  const [restaurantName, setRestaurantName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validation = useMemo(() => {
    const nameOk = restaurantName.trim().length >= MIN_TEXT_LENGTH;
    const cityOk = city.trim().length >= MIN_TEXT_LENGTH;
    const emailOk = isValidEmail(submitterEmail);
    const websiteOk = isValidWebsite(website);
    return { nameOk, cityOk, emailOk, websiteOk, formOk: nameOk && cityOk && emailOk && websiteOk };
  }, [restaurantName, city, submitterEmail, website]);

  const canSubmit = validation.formOk && !submitting;

  const addSubmissionFromApp = useAdminStore((s) => s.addSubmissionFromApp);

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    const payload = {
      restaurantName: restaurantName.trim(),
      city: city.trim(),
      address: address.trim() || undefined,
      website: website.trim() || undefined,
      contactInfo: contactInfo.trim() || undefined,
      notes: notes.trim() || undefined,
      submitterName: submitterName.trim() || undefined,
      submitterEmail: submitterEmail.trim() || undefined,
    };

    setSubmitting(true);
    try {
      addSubmissionFromApp(payload);
      const savedRemote = await submitRestaurantToSupabase(payload);

      if (savedRemote) {
        hapticSuccess();
        Alert.alert(t('submit.success_title'), t('submit.success_message_supabase'), [
          { text: t('common.accept'), onPress: () => navigation.goBack() },
        ]);
        return;
      }

      const sent = await submitRestaurantViaEmail(payload);

      if (sent) {
        hapticSuccess();
        Alert.alert(t('submit.success_title'), t('submit.success_message'), [
          { text: t('common.accept'), onPress: () => navigation.goBack() },
        ]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {submitting ? <LoadingSpinner fullscreen message={t('common.loading')} /> : null}
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
        <Text style={styles.headerTitle}>{t('submit.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hintBanner}>
            <MaterialCommunityIcons name="information-outline" size={22} color={colors.primary} />
            <Text style={styles.hintText}>{t('submit.hint')}</Text>
          </View>

          <Text style={styles.sectionLabel}>{t('submit.section_required')}</Text>
          <FormField
            label={t('submit.restaurant_name_label')}
            value={restaurantName}
            onChangeText={setRestaurantName}
            placeholder={t('submit.restaurant_name_placeholder')}
            required
            hasError={restaurantName.length > 0 && !validation.nameOk}
            errorText={t('submit.validation_min_length')}
          />
          <FormField
            label={t('submit.city_label')}
            value={city}
            onChangeText={setCity}
            placeholder={t('submit.city_placeholder')}
            required
            hasError={city.length > 0 && !validation.cityOk}
            errorText={t('submit.validation_min_length')}
          />

          <Text style={styles.sectionLabel}>{t('submit.section_optional')}</Text>
          <FormField
            label={t('submit.address_label')}
            value={address}
            onChangeText={setAddress}
            placeholder={t('submit.address_placeholder')}
          />
          <FormField
            label={t('submit.website_label')}
            value={website}
            onChangeText={setWebsite}
            placeholder={t('submit.website_placeholder')}
            keyboardType="url"
            autoCapitalize="none"
            hasError={website.length > 0 && !validation.websiteOk}
            errorText={t('submit.validation_website')}
          />
          <FormField
            label={t('submit.contact_label')}
            value={contactInfo}
            onChangeText={setContactInfo}
            placeholder={t('submit.contact_placeholder')}
          />
          <FormField
            label={t('submit.notes_label')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('submit.notes_placeholder')}
            multiline
          />

          <Text style={styles.sectionLabel}>{t('submit.section_submitter')}</Text>
          <FormField
            label={t('submit.submitter_name_label')}
            value={submitterName}
            onChangeText={setSubmitterName}
            placeholder={t('submit.submitter_name_placeholder')}
          />
          <FormField
            label={t('submit.submitter_email_label')}
            value={submitterEmail}
            onChangeText={setSubmitterEmail}
            placeholder={t('submit.submitter_email_placeholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            hasError={submitterEmail.length > 0 && !validation.emailOk}
            errorText={t('submit.validation_email')}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              !canSubmit && styles.submitDisabled,
              pressed && canSubmit && styles.submitPressed,
            ]}
          >
            <Text style={styles.submitLabel}>{t('submit.submit_button')}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'url' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  hasError?: boolean;
  errorText?: string;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  required,
  multiline,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  hasError,
  errorText,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, multiline && styles.inputMultiline, hasError && styles.inputError]}
        multiline={multiline}
        numberOfLines={multiline ? 5 : 1}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        selectionColor={colors.primary}
      />
      {hasError && errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
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
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.cardPadding,
    gap: spacing.cardPadding,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: {
    opacity: 0.85,
  },
  headerTitle: {
    ...typography.h3,
    flex: 1,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.sectionGap,
    gap: spacing.cardPadding,
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.cardPadding,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.cardPadding,
    marginBottom: spacing.sm,
  },
  hintText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.overline,
    marginTop: spacing.sm,
    color: colors.primary,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.cardPadding,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.error,
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  submitButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitPressed: {
    opacity: 0.9,
  },
  submitLabel: {
    ...typography.button,
    fontWeight: '700',
    color: colors.background,
  },
});

export default SubmitRestaurantScreen;
