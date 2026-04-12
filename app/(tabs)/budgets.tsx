import { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { useDepenseStore } from '../../src/stores/depenseStore';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';

export default function Budgets() {
  const mois = new Date().getMonth() + 1;
  const annee = new Date().getFullYear();
  const router = useRouter();

  const { budgets, isLoading, chargerBudgets, supprimer } = useBudgetStore();
  const totalBudget = budgets.reduce((acc, b) => acc + b.montant_limite, 0);
  const totalDepense = budgets.reduce((acc, b) => acc + b.montant_depense, 0);

  // Recharger à chaque fois que l'écran devient visible
  useFocusEffect(
    useCallback(() => {
      chargerBudgets(mois, annee);
    }, [mois, annee])
  );

  const confirmerSuppression = (id: number, nom: string) => {
    Alert.alert(
      'Supprimer le budget',
      `Supprimer le budget "${nom}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => supprimer(id),
        },
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

  const pctTotal = totalBudget > 0
    ? Math.round((totalDepense / totalBudget) * 100) : 0;
  const couleurTotal = pctTotal >= 100 ? '#A32D2D'
    : pctTotal >= 80 ? '#BA7517' : '#3B6D11';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header mois */}
        <View style={styles.headerMois}>
          <Text style={styles.headerMoisText}>
            {new Date().toLocaleDateString('fr-FR', {
              month: 'long', year: 'numeric',
            })}
          </Text>
        </View>

        {/* Carte budget total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Budget total du mois</Text>
          <Text style={styles.totalValue}>{totalBudget.toFixed(2)} TND</Text>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              {
                width: `${Math.min(pctTotal, 100)}%`,
                backgroundColor: couleurTotal,
              },
            ]} />
          </View>
          <Text style={styles.totalSub}>
            {totalDepense.toFixed(2)} TND dépensés ({pctTotal}%)
          </Text>
        </View>

        {/* Titre section */}
        <Text style={styles.sectionTitle}>Détail par catégorie</Text>

        {/* Liste budgets */}
        {budgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="pie-chart-outline" size={52} color="#ddd" />
            <Text style={styles.emptyText}>Aucun budget ce mois</Text>
            <Text style={styles.emptySubText}>
              Définissez des limites par catégorie
            </Text>
            <TouchableOpacity
              style={styles.btnCreer}
              onPress={() => router.push('/modals/add-budget')}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.btnCreerText}>Créer un budget</Text>
            </TouchableOpacity>
          </View>
        ) : (
         budgets.map((budget) => {
          const pct = budget.pourcentage ?? 0;
          const pctAffiche = Math.min(pct, 100);

          const couleur = pct > 100 ? '#A32D2D'
          : pct === 100 ? '#BA7517'
          : pct >= 80 ? '#BA7517'
          : '#3B6D11';

          const statutIcon = pct > 100
          ? 'close-circle'
          : pct >= 80
          ? 'warning'
          : 'checkmark-circle';

          const statutText = pct > 100
          ? `Dépassé (+${(pct - 100).toFixed(1)}%)`
          : pct === 100
          ? '⚠ Limite atteinte'
          : pct >= 80
          ? '⚠ Proche limite'
          : '✓ OK';
            return (
              <View key={budget.id} style={styles.budgetCard}>

                {/* Ligne principale */}
                <View style={styles.budgetTop}>
                  <View style={styles.budgetLeft}>
                    <View style={[
                      styles.budgetIconBox,
                      { backgroundColor: budget.categorie_couleur },
                    ]}>
                      <Text style={styles.budgetEmoji}>
                        {budget.categorie_icone}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.budgetNom}>
                        {budget.categorie_nom}
                      </Text>
                      <Text style={styles.budgetLimite}>
                        Limite : {budget.montant_limite.toFixed(2)} TND
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.budgetPct, { color: couleur }]}>
                    {pct}%
                  </Text>
                </View>

                {/* Barre progression */}
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { width: `${pctAffiche}%`, backgroundColor: couleur },
                  ]} />
                </View>

                {/* Ligne bas */}
                <View style={styles.budgetBottom}>
                  <View style={styles.statutBadge}>
                    <Ionicons
                      name={statutIcon as any}
                      size={13}
                      color={couleur}
                    />
                    <Text style={[styles.statutText, { color: couleur }]}>
                      {statutText}
                    </Text>
                  </View>

                  <Text style={styles.budgetMontant}>
                    {budget.montant_depense.toFixed(2)} / {budget.montant_limite.toFixed(2)} TND
                  </Text>

                  {/* Boutons modifier / supprimer */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.btnModifier}
                      onPress={() => router.push({
                        pathname: '/modals/edit-budget',
                        params: {
                          id: String(budget.id),
                          montantLimite: String(budget.montant_limite),
                          categorieId: String(budget.categorie_id),
                          categorieNom: budget.categorie_nom,
                          categorieIcone: budget.categorie_icone,
                        },
                      })}
                    >
                      <Ionicons name="pencil-outline" size={15} color="#185FA5" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnSupprimer}
                      onPress={() => confirmerSuppression(budget.id, budget.categorie_nom)}
                    >
                      <Ionicons name="trash-outline" size={15} color="#A32D2D" />
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            );
          })
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modals/add-budget')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerMois: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  headerMoisText: {
    fontSize: 15, fontWeight: '600', color: '#333', textTransform: 'capitalize',
  },
  btnAjouterHeader: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E6F1FB',
    justifyContent: 'center', alignItems: 'center',
  },

  totalCard: {
    margin: 16, marginTop: 8, padding: 16,
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 0.5, borderColor: '#eee',
  },
  totalLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  totalValue: { fontSize: 28, fontWeight: '700', color: '#185FA5', marginBottom: 12 },
  totalSub: { fontSize: 11, color: '#888', marginTop: 6 },

  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: '#333',
    marginHorizontal: 16, marginBottom: 8,
  },

  emptyContainer: { alignItems: 'center', padding: 40, gap: 8 },
  emptyText: { fontSize: 16, color: '#888', marginTop: 8 },
  emptySubText: { fontSize: 13, color: '#aaa', textAlign: 'center' },
  btnCreer: {
    marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 20,
    backgroundColor: '#185FA5', borderRadius: 10,
  },
  btnCreerText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  budgetCard: {
    backgroundColor: '#fff', marginHorizontal: 12,
    marginBottom: 10, padding: 14, borderRadius: 12,
    borderWidth: 0.5, borderColor: '#eee',
  },
  budgetTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  budgetIconBox: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  budgetEmoji: { fontSize: 20 },
  budgetNom: { fontSize: 14, fontWeight: '600', color: '#333' },
  budgetLimite: { fontSize: 11, color: '#888', marginTop: 2 },
  budgetPct: { fontSize: 15, fontWeight: '700' },

  budgetBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 8,
  },
  statutBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statutText: { fontSize: 11, fontWeight: '500' },
  budgetMontant: { fontSize: 11, color: '#888', flex: 1, textAlign: 'center' },

  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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

  progressBar: {
    height: 6, backgroundColor: '#f0f0f0',
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },

  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#185FA5',
    justifyContent: 'center', alignItems: 'center',
  },
});