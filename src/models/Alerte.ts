export type AlerteType = 'warning' | 'danger';

export interface Alerte {
  id: number;
  budget_id: number;
  type: AlerteType;
  lu: number;
  created_at: string;
}

export type NouvelleAlerte = Omit<Alerte, 'id' | 'created_at' | 'lu'>;

export interface AlerteAvecBudget extends Alerte {
  categorie_nom: string;
  categorie_icone: string;
  montant_limite: number;
  montant_depense: number;
  pourcentage: number;
}