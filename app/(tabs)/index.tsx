import { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useDepenseStore } from '../../src/stores/depenseStore';
import { useBudgetStore } from '../../src/stores/budgetStore';
import { useAlerteStore } from '../../src/stores/alerteStore';
import { useFocusEffect, useRouter } from 'expo-router';

const MOIS_ACTUEL = new Date().getMonth() + 1;
const ANNEE_ACTUELLE = new Date().getFullYear();

export default function Dashboard() {
  const router = useRouter();
  const { totalDepense, solde, totalBudget, isLoading, chargerDepenses } = useDepenseStore();
  const { budgets, chargerBudgets } = useBudgetStore();
  const { alertes, nombreNonLues, marquerToutesLues } = useAlerteStore();

  useFocusEffect(
    useCallback(() => {
      chargerDepenses(MOIS_ACTUEL, ANNEE_ACTUELLE);
      chargerBudgets(MOIS_ACTUEL, ANNEE_ACTUELLE);
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
      </View>
    );
  }

  const pourcentageTotal = totalBudget > 0
    ? Math.round((totalDepense / totalBudget) * 100) : 0;

  const couleurTotal = pourcentageTotal > 100 ? '#A32D2D'
    : pourcentageTotal >= 80 ? '#BA7517' : '#3B6D11';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.greeting}>Bonjour</Text>
        </View>
        <Text style={styles.dateLabel}>
          {new Date().toLocaleDateString('fr-FR', {
            month: 'long', year: 'numeric',
          })}
        </Text>
      </View>

  
      {/* Carte solde */}
      <View style={styles.soldeCard}>
        <View style={styles.soldeHeading}>
          <Text style={styles.soldeLabel}>Solde restant ce mois</Text>
          <Text style={[styles.percentLabel, { color: couleurTotal }]}>
            {pourcentageTotal}%
          </Text>
        </View>
        <Text style={styles.soldeValue}>{solde.toFixed(2)} TND</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {
            width: `${Math.min(pourcentageTotal, 100)}%`,
            backgroundColor: couleurTotal,
          }]} />
        </View>
        <Text style={styles.soldeSub}>
          {totalDepense.toFixed(2)} TND dépensés sur {totalBudget.toFixed(2)} TND
        </Text>
      </View>

      {/* Mini stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Dépensé</Text>
          <Text style={[styles.statValue, { color: '#A32D2D' }]}>
            {totalDepense.toFixed(2)} TND
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Restant</Text>
          <Text style={[styles.statValue, { color: '#3B6D11' }]}>
            {solde.toFixed(2)} TND
          </Text>
        </View>
      </View>

      {/* Alertes */}
      {alertes.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              ⚠ Alertes ({nombreNonLues})
            </Text>
            <TouchableOpacity onPress={marquerToutesLues}>
              <Text style={styles.clearBtn}>Tout lire</Text>
            </TouchableOpacity>
          </View>
          {alertes.map((alerte) => (
            <View
              key={alerte.id}
              style={[
                styles.alerteCard,
                {
                  backgroundColor: alerte.type === 'danger'
                    ? '#FCEBEB' : '#FAEEDA',
                },
              ]}
            >
              <Text style={styles.alerteIcon}>{alerte.categorie_icone}</Text>
              <Text style={[
                styles.alerteText,
                { color: alerte.type === 'danger' ? '#A32D2D' : '#854F0B' },
              ]}>
                {alerte.categorie_nom} — {alerte.type === 'danger'
                  ? `Dépassé ! (${alerte.pourcentage}%)`
                  : `Proche limite (${alerte.pourcentage}%)`}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Budgets par catégorie */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budgets par catégorie</Text>
        {budgets.length === 0 ? (
          <Text style={styles.emptyText}>Aucun budget défini ce mois</Text>
        ) : (
          budgets.map((budget) => {
            const pct = budget.pourcentage ?? 0;
            const pctAffiche = Math.min(pct, 100);
            const couleurBarre = pct > 100 ? '#A32D2D'
              : pct >= 80 ? '#BA7517' : '#3B6D11';
          
            return (
              <View key={budget.id} style={styles.budgetItem}>
                <View style={styles.budgetTop}>
                  <Text style={styles.budgetNom}>
                    {budget.categorie_icone}  {budget.categorie_nom}
                  </Text>
                  <Text style={[styles.budgetPct, { color: couleurBarre }]}>
                    {pct}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, {
                    width: `${pctAffiche}%`,
                    backgroundColor: couleurBarre,
                  }]} />
                </View>
                <View style={styles.budgetBottom}>
                  <Text style={styles.budgetSub}>
                    {budget.montant_depense.toFixed(2)} / {budget.montant_limite.toFixed(2)} TND
                  </Text>
                  <Text style={[styles.statutText, { color: couleurBarre }]}>
                    
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  pageHeader: {
    marginTop: 24, marginHorizontal: 16,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: 16,
  },
  greeting: { fontSize: 16, color: '#888' },
  title: { fontSize: 26, fontWeight: '700', color: '#185FA5' },
  dateLabel: { fontSize: 12, color: '#888', textTransform: 'capitalize' },

  shortcutsRow: {
    flexDirection: 'row', gap: 12,
    marginHorizontal: 16, marginBottom: 16,
  },
  shortcutBtn: {
    flex: 1, padding: 14,
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 0.5, borderColor: '#eee',
  },
  shortcutTitle: {
    fontSize: 13, fontWeight: '600',
    color: '#185FA5', marginBottom: 4,
  },
  shortcutSub: { fontSize: 11, color: '#888' },

  soldeCard: {
    marginHorizontal: 16, padding: 20,
    backgroundColor: '#fff', borderRadius: 18,
    borderWidth: 0.5, borderColor: '#eee',
  },
  soldeHeading: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  soldeLabel: { fontSize: 13, color: '#888' },
  percentLabel: { fontSize: 13, fontWeight: '700' },
  soldeValue: {
    fontSize: 32, fontWeight: '700',
    color: '#185FA5', marginBottom: 14,
  },
  soldeSub: { fontSize: 12, color: '#888', marginTop: 12 },

  statsRow: {
    flexDirection: 'row', gap: 12,
    marginHorizontal: 16, marginTop: 16,
  },
  statCard: {
    flex: 1, padding: 16, backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 0.5, borderColor: '#eee',
  },
  statLabel: { fontSize: 11, color: '#888', marginBottom: 8 },
  statValue: { fontSize: 16, fontWeight: '700' },

  section: { marginHorizontal: 16, marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14, fontWeight: '600',
    color: '#333', marginBottom: 8,
  },
  clearBtn: { fontSize: 12, color: '#185FA5' },

  alerteCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 12,
    marginBottom: 8, gap: 10,
  },
  alerteIcon: { fontSize: 16 },
  alerteText: { fontSize: 12, flex: 1 },

  budgetItem: {
    backgroundColor: '#fff', padding: 14,
    borderRadius: 14, marginBottom: 10,
    borderWidth: 0.5, borderColor: '#eee',
  },
  budgetTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 10,
  },
  budgetNom: { fontSize: 13, fontWeight: '600', color: '#333' },
  budgetPct: { fontSize: 12, fontWeight: '700' },
  budgetBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 6,
  },
  budgetSub: { fontSize: 11, color: '#888' },
  statutText: { fontSize: 11, fontWeight: '500' },

  progressBar: {
    height: 6, backgroundColor: '#eee',
    borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  emptyText: {
    fontSize: 13, color: '#888',
    textAlign: 'center', padding: 16,
  },
});