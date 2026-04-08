export interface Categorie {
  id: number;
  nom: string;
  icone: string;
  couleur: string;
}

export type NouvelleCategorie = Omit<Categorie, 'id'>;