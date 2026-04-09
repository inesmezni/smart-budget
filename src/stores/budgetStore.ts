import { create } from 'zustand';
import { BudgetAvecCategorie, NouveauBudget } from '../models';
import {
  ajouterBudget,
  modifierBudget,
  supprimerBudget,
  getBudgetsParMois,
} from '../db/repositories/budgetRepo';
import { useAlerteStore } from './alerteStore';

// Store zustand pour l'état des budgets mensuels
interface BudgetStore {
  budgets: BudgetAvecCategorie[];
  isLoading: boolean;
  moisActuel: number;
  anneeActuelle: number;

  chargerBudgets: (mois: number, annee: number) => Promise<void>;
  ajouter: (budget: NouveauBudget) => Promise<void>;
  modifier: (id: number, budget: Partial<NouveauBudget>) => Promise<void>;
  supprimer: (id: number) => Promise<void>;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  // état initial

  budgets: [],
  isLoading: false,
  moisActuel: new Date().getMonth() + 1,
  anneeActuelle: new Date().getFullYear(),

  // Charger les budgets pour un mois et une année donnés
  chargerBudgets: async (mois, annee) => {
    set({ isLoading: true });
    try {
      const budgets = await getBudgetsParMois(mois, annee);
      set({
        budgets,
        moisActuel: mois,
        anneeActuelle: annee,
        isLoading: false,
      });

      // Déclencher la vérification des alertes après chargement
      await useAlerteStore.getState().verifierAlertes(budgets);
    } catch (error) {
      console.error('❌ Erreur chargement budgets:', error);
      set({ isLoading: false });
    }
  },

  // Ajouter un nouveau budget et recharger les budgets actuels
  ajouter: async (budget) => {
    try {
      await ajouterBudget(budget);
      const { moisActuel, anneeActuelle } = get();
      await get().chargerBudgets(moisActuel, anneeActuelle);
      console.log('✅ Budget ajouté et store rechargé');
    } catch (error) {
      console.error('❌ Erreur ajout budget:', error);
    }
  },

  // Modifier un budget existant et mettre à jour le store
  modifier: async (id, budget) => {
    try {
      await modifierBudget(id, budget);
      const { moisActuel, anneeActuelle } = get();
      await get().chargerBudgets(moisActuel, anneeActuelle);
      console.log('✅ Budget modifié et store rechargé');
    } catch (error) {
      console.error('❌ Erreur modification budget:', error);
    }
  },

  // Supprimer un budget et recharger les budgets
  supprimer: async (id) => {
    try {
      await supprimerBudget(id);
      const { moisActuel, anneeActuelle } = get();
      await get().chargerBudgets(moisActuel, anneeActuelle);
      console.log('✅ Budget supprimé et store rechargé');
    } catch (error) {
      console.error('❌ Erreur suppression budget:', error);
    }
  },
}));