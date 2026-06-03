import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import { SPACE_LG, SPACE_XL, SPACE_XXL } from '../theme/spacing';

function AboutScreen() {
  const { t } = useTranslation();

  const sections = [
    { title: t('about.mission_title'), body: t('about.mission_body') },
    { title: t('about.concept_title'), body: t('about.concept_body') },
    { title: t('about.maker_title'), body: t('about.maker_body') },
  ];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {sections.map((section) => (
        <View key={section.title} style={styles.block}>
          <Text style={styles.heading}>{section.title}</Text>
          <Text style={styles.body}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: SPACE_XL,
    paddingVertical: SPACE_LG,
    paddingBottom: SPACE_XXL,
    gap: SPACE_XL,
  },
  block: {
    gap: SPACE_LG,
  },
  heading: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
});

export default AboutScreen;
