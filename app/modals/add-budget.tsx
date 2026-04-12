import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { useCategorieStore } from '../../src/stores/categorieStore';

export default function AddBudget() {
  const router = useRouter();
  const { ajouter } = useBudgetStore();
  const { categories, chargerCategories, isLoading } = useCategorieStore();

  const [categorieId, setCategorieId] = useState<number | null>(null);
  const [montantLimite, setMontantLimite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mois = new Date().getMonth() + 1;
  const annee = new Date().getFullYear();

  useEffect(() => {
    chargerCategories();
  }, []);

  const handleSave = async () => {
    const montantValue = parseFloat(montantLimite.replace(',', '.'));
    if (!categorieId) {
      Alert.alert('Catégorie requise', 'Veuillez sélectionner une catégorie.');
      return;
    }
    if (!montantValue || montantValue <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant supérieur à 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await ajouter({
        categorie_id: categorieId,
        montant_limite: montantValue,
        mois,
        annee,
      });
      router.back();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le budget.');
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

        {/* Montant */}
        <View style={styles.valueCard}>
          <Text style={styles.valueLabel}>Montant limite (TND)</Text>
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

        {/* Mois */}
        <View style={styles.moisCard}>
          <Text style={styles.moisLabel}>Mois concerné</Text>
          <Text style={styles.moisValue}>
            {new Date().toLocaleDateString('fr-FR', {
              month: 'long', year: 'numeric',
            })}
          </Text>
        </View>

        {/* Catégories */}
        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.catsGrid}>
          {isLoading ? (
            <ActivityIndicator color="#185FA5" />
          ) : (
            categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catCard,
                  categorieId === cat.id && styles.catCardActive,
                ]}
                onPress={() => setCategorieId(cat.id)}
              >
                <Text style={styles.catEmoji}>{cat.icone}</Text>
                <Text style={[
                  styles.catNom,
                  categorieId === cat.id && styles.catNomActive,
                ]}>
                  {cat.nom}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Bouton */}
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Enregistrement...' : 'Créer le budget'}
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
  valueCard: {
    padding: 20, borderRadius: 18,
    backgroundColor: '#f5f8ff', marginBottom: 12, alignItems: 'center',
  },
  valueLabel: { fontSize: 13, color: '#7d8ca3', marginBottom: 10 },
  amountInput: {
    width: '100%', textAlign: 'center',
    fontSize: 36, fontWeight: '700', color: '#185FA5',
    paddingBottom: 4, borderBottomWidth: 2, borderBottomColor: '#185FA5',
  },
  moisCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, backgroundColor: '#f8f9fa', borderRadius: 12,
    marginBottom: 16, borderWidth: 0.5, borderColor: '#eee',
  },
  moisLabel: { fontSize: 13, color: '#888' },
  moisValue: {
    fontSize: 14, fontWeight: '600', color: '#185FA5', textTransform: 'capitalize',
  },
  label: { fontSize: 14, color: '#333', marginBottom: 10, fontWeight: '600' },
  catsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20,
  },
  catCard: {
    width: '29%', padding: 12, borderRadius: 12,
    alignItems: 'center', backgroundColor: '#f8f9fa',
    borderWidth: 1, borderColor: '#eee',
  },
  catCardActive: {
    backgroundColor: '#E6F1FB', borderColor: '#185FA5', borderWidth: 2,
  },
  catEmoji: { fontSize: 24, marginBottom: 6 },
  catNom: { fontSize: 11, color: '#555', textAlign: 'center' },
  catNomActive: { color: '#185FA5', fontWeight: '600' },
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