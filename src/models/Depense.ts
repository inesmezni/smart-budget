export interface Depense {
  id: number;
  categorie_id: number;
  montant: number;
  description: string;
  date: string;
  created_at: string;
}

export type NouvelleDepense = Omit<Depense, 'id' | 'created_at'>;

export interface DepenseAvecCategorie extends Depense {
  categorie_nom: string;
  categorie_icone: string;
  categorie_couleur: string;
}