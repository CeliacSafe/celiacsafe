import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

import type { PerfilStackParamList } from '../navigation/PerfilStack';
import { colors } from '../theme/colors';
import { RADIUS_BUTTON, RADIUS_INPUT, RADIUS_SUB } from '../theme/radii';
import { SPACE_LG, SPACE_MD, SPACE_SM, SPACE_XL, SPACE_XXL } from '../theme/spacing';
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
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('www.')
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

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    try {
      const sent = await submitRestaurantViaEmail({
        restaurantName: restaurantName.trim(),
        city: city.trim(),
        address: address.trim() || undefined,
        website: website.trim() || undefined,
        contactInfo: contactInfo.trim() || undefined,
        notes: notes.trim() || undefined,
        submitterName: submitterName.trim() || undefined,
        submitterEmail: submitterEmail.trim() || undefined,
      });

      if (sent) {
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
            <MaterialCommunityIcons
              name="information-outline"
              size={22}
              color={colors.primary}
            />
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
            {submitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.submitLabel}>{t('submit.submit_button')}</Text>
            )}
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
    paddingHorizontal: SPACE_XL,
    paddingBottom: SPACE_MD,
    gap: SPACE_MD,
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
    flex: 1,
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACE_XL,
    paddingBottom: SPACE_XXL,
    gap: SPACE_MD,
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACE_MD,
    backgroundColor: colors.surface,
    borderRadius: RADIUS_SUB,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: SPACE_MD,
    marginBottom: SPACE_SM,
  },
  hintText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionLabel: {
    marginTop: SPACE_SM,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  field: {
    gap: SPACE_SM,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS_INPUT,
    paddingHorizontal: SPACE_MD + 2,
    paddingVertical: SPACE_MD,
    color: colors.textPrimary,
    fontSize: 15,
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
    color: colors.error,
    fontSize: 12,
  },
  submitButton: {
    marginTop: SPACE_LG,
    backgroundColor: colors.primary,
    borderRadius: RADIUS_BUTTON,
    paddingVertical: SPACE_MD + 2,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitPressed: {
    opacity: 0.9,
  },
  submitLabel: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SubmitRestaurantScreen;
