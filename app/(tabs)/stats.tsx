import { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, Dimensions, TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
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

  const { totauxParCategorie, totalDepense, isLoading, chargerDepenses } = useDepenseStore();

  // ✅ recharger à chaque fois que l'écran est visible
  useFocusEffect(
    useCallback(() => {
      chargerDepenses(moisSelectionne, anneeSelectionne);
    }, [moisSelectionne, anneeSelectionne])
  );

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

  // ✅ données vides si aucune dépense
  const chartData = {
    labels: dataFiltree.length > 0
      ? dataFiltree.map((t) => t.categorie_nom.substring(0, 6))
      : ['Aucune'],
    datasets: [{
      data: dataFiltree.length > 0
        ? dataFiltree.map((t) => t.total)
        : [0],
    }],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>
            {formatMois(moisSelectionne, anneeSelectionne)}
          </Text>
          <Text style={styles.headerSubtitle}>Statistiques</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => changerMois(-1)}
          >
            <Text style={styles.monthButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => changerMois(1)}
          >
            <Text style={styles.monthButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Graphique barres */}
      <View style={styles.chartCard}>

        {/* ✅ titre correct */}
        <Text style={styles.chartSmallTitle}>
          DÉPENSES PAR CATÉGORIE — {formatMois(moisSelectionne, anneeSelectionne).toUpperCase()}
        </Text>

        {dataFiltree.length === 0 ? (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>Aucune dépense ce mois</Text>
          </View>
        ) : (
          <BarChart
            data={chartData}
            width={screenWidth - 48}
            height={220}
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
        )}

        {/* ✅ total réel */}
        {dataFiltree.length > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total dépensé ce mois</Text>
            <Text style={[styles.summaryValue, { color: '#185FA5' }]}>
              {totalDepense.toFixed(2)} TND
            </Text>
          </View>
        )}
      </View>

      {/* Répartition par catégorie */}
      {dataFiltree.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>RÉPARTITION CE MOIS</Text>
          {dataFiltree
            .sort((a, b) => b.total - a.total)
            .map((item) => {
              const pct = totalDepense > 0
                ? Math.round((item.total / totalDepense) * 100) : 0;
              return (
                <View key={item.categorie_nom} style={styles.repartitionItem}>
                  <View style={styles.repartitionLeft}>
                    <View style={[
                      styles.colorDot,
                      { backgroundColor: item.categorie_couleur }
                    ]} />
                    <Text style={styles.repartitionNom}>
                      {item.categorie_icone} {item.categorie_nom}
                    </Text>
                  </View>
                  <View style={styles.repartitionRight}>
                    <Text style={styles.repartitionTotal}>
                      {item.total.toFixed(2)} TND
                    </Text>
                    <Text style={styles.repartitionPct}>{pct}%</Text>
                  </View>
                </View>
              );
            })}

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total dépensé</Text>
            <Text style={styles.totalValue}>{totalDepense.toFixed(2)} TND</Text>
          </View>
        </>
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
  headerTitle: {
    fontSize: 18, fontWeight: '700',
    color: '#185FA5', textTransform: 'capitalize',
  },
  headerSubtitle: { fontSize: 12, color: '#888', marginTop: 4 },
  headerButtons: { flexDirection: 'row' },
  monthButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#ddd', marginLeft: 8,
  },
  monthButtonText: { fontSize: 18, color: '#185FA5' },

  chartCard: {
    marginHorizontal: 16, padding: 16,
    backgroundColor: '#fff', borderRadius: 18,
    borderWidth: 0.5, borderColor: '#eee', marginBottom: 16,
  },
  chartSmallTitle: {
    fontSize: 11, fontWeight: '700', color: '#333',
    marginBottom: 12, letterSpacing: 0.5,
  },
  chart: { borderRadius: 12 },
  emptyChart: {
    height: 120, justifyContent: 'center', alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 12,
  },
  summaryLabel: { fontSize: 12, color: '#888' },
  summaryValue: { fontSize: 12, fontWeight: '700' },

  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: '#555',
    marginHorizontal: 16, marginBottom: 8, letterSpacing: 0.5,
  },
  emptyText: { fontSize: 13, color: '#888', textAlign: 'center' },

  repartitionItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 16, marginBottom: 8,
    padding: 14, borderRadius: 14,
    borderWidth: 0.5, borderColor: '#eee',
  },
  repartitionLeft: { flexDirection: 'row', alignItems: 'center' },
  colorDot: {
    width: 10, height: 10, borderRadius: 5, marginRight: 10,
  },
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