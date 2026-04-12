import { create } from 'zustand';
import { AlerteAvecBudget, BudgetAvecCategorie } from '../models';
import {
  ajouterAlerte,
  getAlertesNonLues,
  marquerAlerteLue,
  marquerToutesAlertesLues,
  alerteExisteDeja,
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
      set({ alertes, nombreNonLues: alertes.length, isLoading: false });
    } catch (error) {
      console.error('❌ Erreur chargement alertes:', error);
      set({ isLoading: false });
    }
  },

  verifierAlertes: async (budgets) => {
    try {
      for (const budget of budgets) {
        const pourcentage = budget.pourcentage ?? 0;

        // WARNING — entre 80% et 100%
        if (pourcentage >= 80 && pourcentage <= 100) {
          const existe = await alerteExisteDeja(budget.id, 'warning');
          if (!existe) {
            await ajouterAlerte({ budget_id: budget.id, type: 'warning' });
            console.log(`⚠️ Warning: ${budget.categorie_nom} à ${pourcentage}%`);
          }
        }

        // DANGER — plus de 100%
        if (pourcentage > 100) {
          const existe = await alerteExisteDeja(budget.id, 'danger');
          if (!existe) {
            await ajouterAlerte({ budget_id: budget.id, type: 'danger' });
            console.log(`🚨 Danger: ${budget.categorie_nom} à ${pourcentage}%`);
          }
        }
      }
      await get().chargerAlertes();
    } catch (error) {
      console.error('❌ Erreur vérification alertes:', error);
    }
  },

  marquerLue: async (id) => {
    try {
      await marquerAlerteLue(id);
      await get().chargerAlertes();
    } catch (error) {
      console.error('❌ Erreur marquer alerte lue:', error);
    }
  },

  marquerToutesLues: async () => {
    try {
      await marquerToutesAlertesLues();
      await get().chargerAlertes();
    } catch (error) {
      console.error('❌ Erreur marquer toutes alertes lues:', error);
    }
  },
}));