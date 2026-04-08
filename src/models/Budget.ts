export interface Budget {
  id: number;
  categorie_id: number;
  montant_limite: number;
  mois: number;
  annee: number;
}

export type NouveauBudget = Omit<Budget, 'id'>;

export interface BudgetAvecCategorie extends Budget {
  categorie_nom: string;
  categorie_icone: string;
  categorie_couleur: string;
  montant_depense: number;
  pourcentage: number;
}