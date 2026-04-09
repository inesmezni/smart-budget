import { create } from 'zustand';
import { Alerte, AlerteAvecBudget, BudgetAvecCategorie } from '../models';
import {
  ajouterAlerte,
  getAlertesNonLues,
  marquerAlerteLue,
  marquerToutesAlertesLues,
} from '../db/repositories/alerteRepo';

interface AlerteStore {
  alertes: AlerteAvecBudget[];
  nombreNonLues: number;
  isLoading: boolean;

  chargerAlertes: () => Promise<void>;
  verifierAlertes: (budgets: BudgetAvecCategorie[]) => Promise<void>;
  marquerLue: (id: number) => Promise<void>;
  marquerToutesLues: () => Promise<void>;
}

export const useAlerteStore = create<AlerteStore>((set, get) => ({
  alertes: [],
  nombreNonLues: 0,
  isLoading: false,

  chargerAlertes: async () => {
    set({ isLoading: true });
    try {
      const alertes = await getAlertesNonLues();
      set({
        alertes,
        nombreNonLues: alertes.length,
        isLoading: false,
      });
    } catch (error) {
      console.error('❌ Erreur chargement alertes:', error);
      set({ isLoading: false });
    }
  },

  // ── Détection automatique 80% et 100% ──────────────
  verifierAlertes: async (budgets) => {
    try {
      for (const budget of budgets) {
        const pourcentage = budget.pourcentage ?? 0;

        // Alerte WARNING — 80% atteint
        if (pourcentage >= 80 && pourcentage < 100) {
          await ajouterAlerte({
            budget_id: budget.id,
            type: 'warning',
          });
          console.log(`⚠️ Alerte warning: ${budget.categorie_nom} à ${pourcentage}%`);
        }

        // Alerte DANGER — 100% dépassé
        if (pourcentage >= 100) {
          await ajouterAlerte({
            budget_id: budget.id,
            type: 'danger',
          });
          console.log(`🚨 Alerte danger: ${budget.categorie_nom} à ${pourcentage}%`);
        }
      }

      // Recharger les alertes après vérification
      await get().chargerAlertes();
    } catch (error) {
      console.error('❌ Erreur vérification alertes:', error);
    }
  },

  marquerLue: async (id) => {
    try {
      await marquerAlerteLue(id);
      await get().chargerAlertes();
      console.log('✅ Alerte marquée lue');
    } catch (error) {
      console.error('❌ Erreur marquer alerte lue:', error);
    }
  },

  marquerToutesLues: async () => {
    try {
      await marquerToutesAlertesLues();
      await get().chargerAlertes();
      console.log('✅ Toutes alertes marquées lues');
    } catch (error) {
      console.error('❌ Erreur marquer toutes alertes lues:', error);
    }
  },
}));