import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { migrateDatabase } from './src/db/migrations';

export default function App() {
  useEffect(() => {
    migrateDatabase().catch((error) => {
      console.error('❌ Erreur initialisation BD:', error);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Budget</Text>
      <Text style={styles.subtitle}>
        Suivi de dépenses automatique, budgets mensuels et alertes en temps réel.
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#4B5563',
  },
});
