import * as Application from 'expo-application';
import * as MailComposer from 'expo-mail-composer';
import { Alert, Linking } from 'react-native';

import { ERRORS_EMAIL, SUBMISSION_EMAIL } from '../constants/appContact';
import i18n from '../i18n';
import { hapticError } from './haptics';

export interface SubmissionData {
  restaurantName: string;
  city: string;
  countryCode?: 'ES' | 'DE';
  address?: string;
  website?: string;
  contactInfo?: string;
  notes?: string;
  submitterName?: string;
  submitterEmail?: string;
}

/** @deprecated Alias fuer SubmissionData — bitte SubmissionData verwenden. */
export type RestaurantSubmissionData = SubmissionData;

function buildSubmissionBody(data: SubmissionData): string {
  return [
    '=== Restaurant-Vorschlag ===',
    '',
    `Name: ${data.restaurantName}`,
    `Stadt: ${data.city}`,
    `Land: ${data.countryCode ?? 'ES'}`,
    data.address ? `Adresse: ${data.address}` : '',
    data.website ? `Webseite: ${data.website}` : '',
    data.contactInfo ? `Kontakt: ${data.contactInfo}` : '',
    data.notes ? `Notizen: ${data.notes}` : '',
    '',
    '--- Vorschlagender ---',
    data.submitterName ? `Name: ${data.submitterName}` : '(anonym)',
    data.submitterEmail ? `E-Mail: ${data.submitterEmail}` : '',
    '',
    '--- App-Info ---',
    `Gesendet am: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Oeffnet die Mail-App mit vorausgefuellter Vorschlag-Nachricht.
 * Primaer MailComposer; Fallback mailto: wenn kein Mail-Client verfuegbar.
 */
export async function submitRestaurantViaEmail(
  data: SubmissionData,
  recipient: string = SUBMISSION_EMAIL
): Promise<boolean> {
  const body = buildSubmissionBody(data);
  const subject = `CeliacSafe-Vorschlag: ${data.restaurantName}`;

  try {
    const isAvailable = await MailComposer.isAvailableAsync();

    if (isAvailable) {
      const result = await MailComposer.composeAsync({
        recipients: [recipient],
        subject,
        body,
      });

      return (
        result.status === MailComposer.MailComposerStatus.SENT ||
        result.status === MailComposer.MailComposerStatus.SAVED
      );
    }

    const url = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Submission error:', error);
    hapticError();
    Alert.alert(i18n.t('common.error'), i18n.t('submit.mail_error'));
    return false;
  }
}

/** Oeffnet E-Mail fuer Fehlerbericht mit App-Version im Text. */
export async function reportErrorViaEmail(recipient: string = ERRORS_EMAIL): Promise<void> {
  const available = await MailComposer.isAvailableAsync();
  if (!available) {
    hapticError();
    Alert.alert(i18n.t('common.error'), i18n.t('profile.mail_not_available'));
    return;
  }

  const version = Application.nativeApplicationVersion ?? '?';

  await MailComposer.composeAsync({
    recipients: [recipient],
    subject: i18n.t('profile.report_email_subject'),
    body: i18n.t('profile.report_email_body', { version }),
  });
}
