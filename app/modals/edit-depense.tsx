import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDepenseStore } from '../../src/stores/depenseStore';
import { useCategorieStore } from '../../src/stores/categorieStore';

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

export default function EditDepense() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { modifier } = useDepenseStore();
  const { categories, chargerCategories, isLoading } = useCategorieStore();

  // Pré-remplir avec les données existantes
  const [categorieId, setCategorieId] = useState<number | null>(
    params.categorieId ? Number(params.categorieId) : null
  );
  const [montant, setMontant] = useState(
    params.montant ? String(params.montant) : ''
  );
  const [description, setDescription] = useState(
    params.description ? String(params.description) : ''
  );
  const [date, setDate] = useState(
    params.date ? String(params.date) : formatDateInput(new Date())
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    chargerCategories();
  }, []);

  const validerEtEnvoyer = async () => {
    const montantValue = parseFloat(montant.replace(',', '.'));
    if (!categorieId) {
      Alert.alert('Catégorie requise', 'Veuillez sélectionner une catégorie.');
      return;
    }
    if (!montantValue || montantValue <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant supérieur à 0.');
      return;
    }
    if (!date) {
      Alert.alert('Date requise', 'Veuillez saisir une date valide.');
      return;
    }

    setIsSubmitting(true);
    try {
      await modifier(Number(params.id), {
        categorie_id: categorieId,
        montant: montantValue,
        description,
        date,
      });
      router.back();
    } catch (error) {
      console.error('Erreur modification dépense', error);
      Alert.alert('Erreur', 'Impossible de modifier la dépense.');
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
          <Text style={styles.valueLabel}>Montant (TND)</Text>
          <TextInput
            value={montant}
            onChangeText={setMontant}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#c1c7d0"
            style={styles.amountInput}
            autoFocus
          />
        </View>

        {/* Catégories */}
        <Text style={styles.label}>Catégorie</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
        >
          {isLoading ? (
            <ActivityIndicator color="#185FA5" />
          ) : (
            categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.chip,
                  categorieId === cat.id && styles.chipActive,
                ]}
                onPress={() => setCategorieId(cat.id)}
              >
                <Text style={[
                  styles.chipText,
                  categorieId === cat.id && styles.chipTextActive,
                ]}>
                  {cat.icone}
                </Text>
                <Text style={[
                  styles.chipLabel,
                  categorieId === cat.id && styles.chipTextActive,
                ]}>
                  {cat.nom}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Description */}
        <Text style={styles.label}>Note (optionnel)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: déjeuner avec collègues..."
          style={styles.input}
          placeholderTextColor="#aaa"
        />

        {/* Date */}
        <Text style={styles.label}>Date</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          style={styles.input}
          placeholderTextColor="#aaa"
        />

        {/* Bouton sauvegarder */}
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={validerEtEnvoyer}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Sauvegarde...' : '✏️ Sauvegarder les modifications'}
          </Text>
        </TouchableOpacity>

        {/* Annuler */}
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
    backgroundColor: '#FFF8E6',
    marginBottom: 20, alignItems: 'center',
  },
  valueLabel: { fontSize: 13, color: '#7d8ca3', marginBottom: 10 },
  amountInput: {
    width: '100%', textAlign: 'center',
    fontSize: 36, fontWeight: '700', color: '#185FA5',
    paddingBottom: 4,
    borderBottomWidth: 2, borderBottomColor: '#185FA5',
  },
  label: { fontSize: 14, color: '#333', marginBottom: 8, marginTop: 16 },
  chipScroll: { marginBottom: 8 },
  chip: {
    minWidth: 90, paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 18, backgroundColor: '#f1f5f9',
    marginRight: 10, alignItems: 'center',
  },
  chipActive: { backgroundColor: '#185FA5' },
  chipText: { fontSize: 18, marginBottom: 6, color: '#333' },
  chipTextActive: { color: '#fff' },
  chipLabel: { fontSize: 12, color: '#333' },
  input: {
    height: 48, borderWidth: 1, borderColor: '#dde3ea',
    borderRadius: 12, paddingHorizontal: 14,
    backgroundColor: '#f8f9fa', color: '#333',
  },
  button: {
    marginTop: 28, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#185FA5',
  },
  buttonDisabled: { backgroundColor: '#aaa' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { marginTop: 14, alignItems: 'center' },
  linkText: { color: '#A32D2D', fontSize: 14, fontWeight: '600' },
});