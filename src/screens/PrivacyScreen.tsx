import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import LegalSubScreenLayout, { LegalSectionBlock } from '../components/LegalSubScreenLayout';
import { parseLegalSections } from '../i18n/legalSections';

function PrivacyScreen() {
  const { t } = useTranslation();

  const sections = useMemo(
    () => parseLegalSections(t('privacy.sections', { returnObjects: true })),
    [t]
  );

  const translationNotice = t('privacy.translation_notice').trim();

  return (
    <LegalSubScreenLayout
      title={t('privacy.title')}
      lastUpdated={t('privacy.last_updated')}
      translationNotice={translationNotice || undefined}
    >
      {sections.map((section) => (
        <LegalSectionBlock key={section.title} title={section.title} body={section.body} />
      ))}
    </LegalSubScreenLayout>
  );
}

export default PrivacyScreen;
