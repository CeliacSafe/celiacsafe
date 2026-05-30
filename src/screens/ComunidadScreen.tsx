import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export function ComunidadScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Celiac Safe</Text>
      <Text style={styles.title}>Comunidad</Text>
      <Text style={styles.subtitle}>Bald verfügbar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    marginBottom: 16,
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
});
