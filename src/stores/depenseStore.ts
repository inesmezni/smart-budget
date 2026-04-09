import { create } from 'zustand';
import { DepenseAvecCategorie, NouvelleDepense } from '../models';
import {
  ajouterDepense,
  modifierDepense,
  supprimerDepense,
  getDepensesParMois,
  getTotalDepensesParMois,
  getTotauxParCategorie,
  getSoldeRestant,
} from '../db/repositories/depenseRepo';

interface DepenseStore {
  depenses: DepenseAvecCategorie[];
  totalDepense: number;
  solde: number;
  totalBudget: number;
  totauxParCategorie: {
    categorie_nom: string;
    categorie_icone: string;
    categorie_couleur: string;
    total: number;
  }[];
  isLoading: boolean;
  moisActuel: number;
  anneeActuelle: number;

  chargerDepenses: (mois: number, annee: number) => Promise<void>;
  ajouter: (depense: NouvelleDepense) => Promise<void>;
  modifier: (id: number, depense: Partial<NouvelleDepense>) => Promise<void>;
  supprimer: (id: number) => Promise<void>;
}

export const useDepenseStore = create<DepenseStore>((set, get) => ({
  depenses: [],
  totalDepense: 0,
  solde: 0,
  totalBudget: 0,
  totauxParCategorie: [],
  isLoading: false,
  moisActuel: new Date().getMonth() + 1,
  anneeActuelle: new Date().getFullYear(),

  chargerDepenses: async (mois, annee) => {
    set({ isLoading: true });
    try {
      const depenses = await getDepensesParMois(mois, annee);
      const total = await getTotalDepensesParMois(mois, annee);
      const totaux = await getTotauxParCategorie(mois, annee);
      const soldeData = await getSoldeRestant(mois, annee);

      set({
        depenses,
        totalDepense: total,
        totauxParCategorie: totaux,
        solde: soldeData.solde,
        totalBudget: soldeData.total_budget,
        moisActuel: mois,
        anneeActuelle: annee,
        isLoading: false,
      });
    } catch (error) {
      console.error('❌ Erreur chargement dépenses:', error);
      set({ isLoading: false });
    }
  },

  ajouter: async (depense) => {
    try {
      await ajouterDepense(depense);
      const { moisActuel, anneeActuelle } = get();
      await get().chargerDepenses(moisActuel, anneeActuelle);
      console.log('✅ Dépense ajoutée et store rechargé');
    } catch (error) {
      console.error('❌ Erreur ajout dépense:', error);
    }
  },

  modifier: async (id, depense) => {
    try {
      await modifierDepense(id, depense);
      const { moisActuel, anneeActuelle } = get();
      await get().chargerDepenses(moisActuel, anneeActuelle);
      console.log('✅ Dépense modifiée et store rechargé');
    } catch (error) {
      console.error('❌ Erreur modification dépense:', error);
    }
  },

  supprimer: async (id) => {
    try {
      await supprimerDepense(id);
      const { moisActuel, anneeActuelle } = get();
      await get().chargerDepenses(moisActuel, anneeActuelle);
      console.log('✅ Dépense supprimée et store rechargé');
    } catch (error) {
      console.error('❌ Erreur suppression dépense:', error);
    }
  },
}));