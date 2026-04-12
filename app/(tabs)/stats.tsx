import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useDepenseStore } from '../../src/stores/depenseStore';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
const formatMois = (mois: number, annee: number) =>
  new Date(annee, mois - 1).toLocaleDateString('fr-FR', {
    month: 'long', year: 'numeric',
  });

export default function Stats() {
  const [moisSelectionne, setMoisSelectionne] = useState(new Date().getMonth() + 1);
  const [anneeSelectionne, setAnneeSelectionne] = useState(new Date().getFullYear());
  const [periode, setPeriode] = useState<'mois' | '3mois' | 'annee'>('mois');

  const { totauxParCategorie, totalDepense, isLoading, chargerDepenses } = useDepenseStore();

  useEffect(() => {
    chargerDepenses(moisSelectionne, anneeSelectionne);
  }, [moisSelectionne, anneeSelectionne]);

  const changerMois = (decalage: number) => {
    const nouvelleDate = new Date(anneeSelectionne, moisSelectionne - 1 + decalage);
    setMoisSelectionne(nouvelleDate.getMonth() + 1);
    setAnneeSelectionne(nouvelleDate.getFullYear());
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
      </View>
    );
  }

  const dataFiltree = totauxParCategorie.filter((t) => t.total > 0);
  const chartData = {
    labels: dataFiltree.map((t) => t.categorie_nom.substring(0, 6)),
    datasets: [{ data: dataFiltree.map((t) => t.total) }],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>{formatMois(moisSelectionne, anneeSelectionne)}</Text>
          <Text style={styles.headerSubtitle}>Statistiques</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.monthButton} onPress={() => changerMois(-1)}>
            <Text style={styles.monthButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.monthButton} onPress={() => changerMois(1)}>
            <Text style={styles.monthButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.periodRow}>
        {['mois', '3mois', 'annee'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.periodButton, periode === option && styles.periodButtonActive]}
            onPress={() => setPeriode(option as 'mois' | '3mois' | 'annee')}
          >
            <Text style={[styles.periodText, periode === option && styles.periodTextActive]}>
              {option === 'mois' ? 'Ce mois' : option === '3mois' ? '3 mois' : 'Année'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartSmallTitle}>ÉVOLUTION MENSUELLE (TND)</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 48}
          height={210}
          yAxisLabel=""
          yAxisSuffix=" TND"
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(24, 95, 165, ${opacity})`,
            labelColor: () => '#888',
            style: { borderRadius: 12 },
          }}
          style={styles.chart}
          showValuesOnTopOfBars
        />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>vs mois dernier</Text>
          <Text style={[styles.summaryValue, { color: '#A32D2D' }]}>+12% ↑</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>RÉPARTITION CE MOIS</Text>
      {dataFiltree.map((item) => {
        const pct = totalDepense > 0
          ? Math.round((item.total / totalDepense) * 100) : 0;
        return (
          <View key={item.categorie_nom} style={styles.repartitionItem}>
            <View style={styles.repartitionLeft}>
              <View style={[styles.colorDot, { backgroundColor: item.categorie_couleur }]} />
              <Text style={styles.repartitionNom}>{item.categorie_icone} {item.categorie_nom}</Text>
            </View>
            <View style={styles.repartitionRight}>
              <Text style={styles.repartitionTotal}>{item.total.toFixed(2)} TND</Text>
              <Text style={styles.repartitionPct}>{pct}%</Text>
            </View>
          </View>
        );
      })}

      {dataFiltree.length > 0 && (
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total dépensé</Text>
          <Text style={styles.totalValue}>{totalDepense.toFixed(2)} TND</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#185FA5', textTransform: 'capitalize' },
  headerSubtitle: { fontSize: 12, color: '#888', marginTop: 4 },
  headerButtons: { flexDirection: 'row' },
  monthButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#ddd',
    marginLeft: 8,
  },
  monthButtonText: { fontSize: 18, color: '#185FA5' },
  periodRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 12 },
  periodButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#eee',
    alignItems: 'center',
  },
  periodButtonActive: { backgroundColor: '#185FA5' },
  periodText: { color: '#666', fontSize: 12, fontWeight: '600' },
  periodTextActive: { color: '#fff' },
  chartCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#eee',
    marginBottom: 16,
  },
  chart: { borderRadius: 12 },
  chartSmallTitle: { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 10, letterSpacing: 0.5 },
  chartTitle: { fontSize: 13, color: '#888', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  summaryLabel: { fontSize: 12, color: '#888' },
  summaryValue: { fontSize: 12, fontWeight: '700' },
  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: '#333',
    marginHorizontal: 16, marginBottom: 8,
  },
  emptyText: { fontSize: 13, color: '#888', textAlign: 'center', padding: 24 },
  repartitionItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 8,
    padding: 14, borderRadius: 14,
    borderWidth: 0.5, borderColor: '#eee',
  },
  repartitionLeft: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 10, height: 10, borderRadius: 2, marginRight: 10 },
  repartitionNom: { fontSize: 13, color: '#333', fontWeight: '600' },
  repartitionRight: { alignItems: 'flex-end' },
  repartitionTotal: { fontSize: 13, fontWeight: '700', color: '#333' },
  repartitionPct: { fontSize: 11, color: '#888', marginTop: 4 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    margin: 16, padding: 16,
    backgroundColor: '#E6F1FB', borderRadius: 14,
  },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#185FA5' },
  totalValue: { fontSize: 14, fontWeight: '700', color: '#185FA5' },
});