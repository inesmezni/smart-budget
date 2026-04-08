import { executeSql } from '../database';
import { Categorie, NouvelleCategorie } from '../../models';

// Récupérer toutes les catégories, triées par nom
export async function getToutesCategories(): Promise<Categorie[]> {
  return await executeSql<Categorie[]>(
    'SELECT * FROM categories ORDER BY nom ASC'
  );
}

// Récupérer une catégorie par son ID
export async function getCategorieById(id: number): Promise<Categorie | null> {
  const result = await executeSql<Categorie[]>(
    'SELECT * FROM categories WHERE id = ?',
    [id]
  );
  return result[0] ?? null;
}

// Ajouter une nouvelle catégorie à la base de données
export async function ajouterCategorie(
  categorie: NouvelleCategorie
): Promise<number> {
  const result = await executeSql(
    `INSERT INTO categories (nom, icone, couleur)
     VALUES (?, ?, ?)`,
    [categorie.nom, categorie.icone, categorie.couleur]
  );
  console.log('✅ Catégorie ajoutée, id:', result.lastInsertRowId);
  return result.lastInsertRowId;
}

// Modifier une catégorie existante (seulement les champs fournis)
export async function modifierCategorie(
  id: number,
  categorie: Partial<NouvelleCategorie>
): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];
  
  if (categorie.nom !== undefined) {
    updates.push('nom = ?');
    values.push(categorie.nom);
  }
  if (categorie.icone !== undefined) {
    updates.push('icone = ?');
    values.push(categorie.icone);
  }
  if (categorie.couleur !== undefined) {
    updates.push('couleur = ?');
    values.push(categorie.couleur);
  }
  
  if (updates.length === 0) return;
  
  values.push(id);
  await executeSql(
    `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  console.log('✅ Catégorie modifiée, id:', id);
}

// Supprimer une catégorie de la base de données
export async function supprimerCategorie(id: number): Promise<void> {
  await executeSql('DELETE FROM categories WHERE id = ?', [id]);
  console.log('✅ Catégorie supprimée, id:', id);
}