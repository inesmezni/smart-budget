import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBudgetStore } from '../../src/stores/budgetStore';

export default function EditBudget() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { modifier } = useBudgetStore();

  const [montantLimite, setMontantLimite] = useState(
    params.montantLimite ? String(params.montantLimite) : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    const montantValue = parseFloat(montantLimite.replace(',', '.'));
    if (!montantValue || montantValue <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant supérieur à 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await modifier(Number(params.id), {
        montant_limite: montantValue,
      });
      router.back();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

        {/* Info catégorie */}
        <View style={styles.categorieCard}>
          <Text style={styles.categorieIcone}>{params.categorieIcone}</Text>
          <Text style={styles.categorieNom}>{params.categorieNom}</Text>
        </View>

        {/* Nouveau montant */}
        <View style={styles.valueCard}>
          <Text style={styles.valueLabel}>Nouveau montant limite (TND)</Text>
          <TextInput
            value={montantLimite}
            onChangeText={setMontantLimite}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#c1c7d0"
            style={styles.amountInput}
            autoFocus
          />
        </View>

        {/* Bouton */}
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Sauvegarde...' : '✏️ Modifier le budget'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => router.back()}>
          <Text style={styles.linkText}>Annuler</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  categorieCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, backgroundColor: '#f8f9fa',
    borderRadius: 14, marginBottom: 16,
    borderWidth: 0.5, borderColor: '#eee',
  },
  categorieIcone: { fontSize: 32 },
  categorieNom: { fontSize: 18, fontWeight: '600', color: '#333' },
  valueCard: {
    padding: 20, borderRadius: 18,
    backgroundColor: '#FFF8E6', marginBottom: 20, alignItems: 'center',
  },
  valueLabel: { fontSize: 13, color: '#7d8ca3', marginBottom: 10 },
  amountInput: {
    width: '100%', textAlign: 'center',
    fontSize: 36, fontWeight: '700', color: '#185FA5',
    paddingBottom: 4, borderBottomWidth: 2, borderBottomColor: '#185FA5',
  },
  button: {
    height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#185FA5', marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#aaa' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { marginTop: 14, alignItems: 'center' },
  linkText: { color: '#A32D2D', fontSize: 14, fontWeight: '600' },
});