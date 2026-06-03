import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import LegalSubScreenLayout, { LegalSectionBlock } from '../components/LegalSubScreenLayout';
import { parseLegalSections } from '../i18n/legalSections';

function ImpressumScreen() {
  const { t } = useTranslation();

  const sections = useMemo(
    () => parseLegalSections(t('impressum.sections', { returnObjects: true })),
    [t]
  );

  return (
    <LegalSubScreenLayout
      title={t('impressum.title')}
      lastUpdated={t('impressum.last_updated')}
      notice={t('impressum.dsb_notice')}
    >
      {sections.map((section) => (
        <LegalSectionBlock key={section.title} title={section.title} body={section.body} />
      ))}
    </LegalSubScreenLayout>
  );
}

export default ImpressumScreen;
