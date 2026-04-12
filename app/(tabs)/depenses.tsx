import { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDepenseStore } from '../../src/stores/depenseStore';
import { useCategorieStore } from '../../src/stores/categorieStore';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

const formatMois = (mois: number, annee: number) =>
  new Date(annee, mois - 1).toLocaleDateString('fr-FR', {
    month: 'long', year: 'numeric',
  });

export default function Depenses() {
  const router = useRouter();
  const moisInitial = new Date().getMonth() + 1;
  const anneeInitial = new Date().getFullYear();

  const [moisSelectionne, setMoisSelectionne] = useState(moisInitial);
  const [anneeSelectionne, setAnneeSelectionne] = useState(anneeInitial);
  const [categorieSelectionnee, setCategorieSelectionnee] = useState<number | null>(null);

  const { depenses, isLoading, chargerDepenses, supprimer } = useDepenseStore();
  const { categories, chargerCategories } = useCategorieStore();

 useFocusEffect(
  useCallback(() => {
    chargerCategories();
    chargerDepenses(moisSelectionne, anneeSelectionne);
  }, [moisSelectionne, anneeSelectionne])
);
  const depensesFiltrees = useMemo(
    () => categorieSelectionnee
      ? depenses.filter((d) => d.categorie_id === categorieSelectionnee)
      : depenses,
    [categorieSelectionnee, depenses]
  );

  const groupes = useMemo(() => {
    return depensesFiltrees.reduce((acc, depense) => {
      const date = depense.date.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(depense);
      return acc;
    }, {} as Record<string, typeof depenses>);
  }, [depensesFiltrees]);

  const changerMois = (decalage: number) => {
    const date = new Date(anneeSelectionne, moisSelectionne - 1 + decalage);
    setMoisSelectionne(date.getMonth() + 1);
    setAnneeSelectionne(date.getFullYear());
  };

  const confirmerSuppression = (id: number, nom: string) => {
    Alert.alert(
      'Supprimer la dépense',
      `Supprimer "${nom}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => supprimer(id) },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Navigation mois */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.monthButton} onPress={() => changerMois(-1)}>
          <Text style={styles.monthButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {formatMois(moisSelectionne, anneeSelectionne)}
        </Text>
        <TouchableOpacity style={styles.monthButton} onPress={() => changerMois(1)}>
          <Text style={styles.monthButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Filtres catégories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ alignItems: 'center', paddingVertical: 4 }}
      >
        <TouchableOpacity
          style={[styles.filterChip, categorieSelectionnee === null && styles.filterChipActive]}
          onPress={() => setCategorieSelectionnee(null)}
        >
          <Text style={[styles.filterChipText, categorieSelectionnee === null && styles.filterChipTextActive]}>
            Toutes
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filterChip, categorieSelectionnee === cat.id && styles.filterChipActive]}
            onPress={() => setCategorieSelectionnee(cat.id)}
          >
            <Text style={[styles.filterChipText, categorieSelectionnee === cat.id && styles.filterChipTextActive]}>
              {cat.icone} {cat.nom}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste des dépenses */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {Object.keys(groupes).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {categorieSelectionnee
                ? 'Aucune dépense dans cette catégorie'
                : 'Aucune dépense ce mois'}
            </Text>
            <Text style={styles.emptySubText}>Appuyez sur + pour ajouter</Text>
          </View>
        ) : (
          Object.entries(groupes)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, deps]) => (
              <View key={date}>
                <Text style={styles.dateLabel}>
                  {new Date(date).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })}
                </Text>
                {deps.map((depense) => (
                  <View key={depense.id} style={styles.depenseItem}>

                    {/* Icône catégorie */}
                    <View style={[styles.iconBox, { backgroundColor: depense.categorie_couleur }]}>
                      <Text style={styles.iconText}>{depense.categorie_icone}</Text>
                    </View>

                    {/* Info dépense */}
                    <View style={styles.depenseInfo}>
                      <Text style={styles.depenseNom}>
                        {depense.description || depense.categorie_nom}
                      </Text>
                      <Text style={styles.depenseCat}>{depense.categorie_nom}</Text>
                    </View>

                    {/* Montant */}
                    <Text style={styles.depenseMontant}>
                      -{depense.montant.toFixed(2)} TND
                    </Text>

                    {/* Boutons action */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.btnModifier}
                        onPress={() => router.push({
                          pathname: '/modals/edit-depense',
                          params: {
                            id: String(depense.id),
                            montant: String(depense.montant),
                            description: depense.description || '',
                            categorieId: String(depense.categorie_id),
                            date: depense.date.split('T')[0],
                          },
                        })}
                      >
                        <Ionicons name="pencil-outline" size={15} color="#185FA5" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnSupprimer}
                        onPress={() => confirmerSuppression(
                          depense.id,
                          depense.description || depense.categorie_nom
                        )}
                      >
                        <Ionicons name="trash-outline" size={15} color="#A32D2D" />
                      </TouchableOpacity>
                    </View>

                  </View>
                ))}
              </View>
            ))
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB + */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modals/add-depense')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 16, fontWeight: '600', color: '#333', textTransform: 'capitalize',
  },
  monthButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#ddd',
  },
  monthButtonText: { fontSize: 18, color: '#185FA5' },
  filterRow: {
    paddingHorizontal: 12, marginBottom: 8,
    flexGrow: 0, flexShrink: 0,
  },
  filterChip: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 0.5, borderColor: '#eee',
    marginRight: 8, height: 34,
    justifyContent: 'center', alignItems: 'center',
  },
  filterChipActive: { backgroundColor: '#185FA5', borderColor: '#185FA5' },
  filterChipText: { fontSize: 12, color: '#333' },
  filterChipTextActive: { color: '#fff' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888', textAlign: 'center' },
  emptySubText: { fontSize: 13, color: '#aaa', marginTop: 6 },
  dateLabel: {
    fontSize: 12, fontWeight: '600', color: '#888',
    padding: 12, paddingBottom: 4, textTransform: 'capitalize',
  },
  depenseItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 12,
    marginBottom: 6, padding: 12, borderRadius: 10,
    borderWidth: 0.5, borderColor: '#eee',
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  iconText: { fontSize: 18 },
  depenseInfo: { flex: 1 },
  depenseNom: { fontSize: 13, fontWeight: '500', color: '#333' },
  depenseCat: { fontSize: 11, color: '#888', marginTop: 2 },
  depenseMontant: { fontSize: 12, fontWeight: '600', color: '#A32D2D', marginRight: 8 },
  actionsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  btnModifier: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#E6F1FB',
    justifyContent: 'center', alignItems: 'center',
  },
  btnSupprimer: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#FCEBEB',
    justifyContent: 'center', alignItems: 'center',
  },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#185FA5',
    justifyContent: 'center', alignItems: 'center',
  },
  fabText: { fontSize: 28, color: '#fff', fontWeight: '300' },
});