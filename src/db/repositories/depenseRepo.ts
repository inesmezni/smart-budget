import { executeSql } from '../database';
import { Depense, NouvelleDepense, DepenseAvecCategorie } from '../../models';

// Ajouter une nouvelle dépense à la base de données
export async function ajouterDepense(depense: NouvelleDepense): Promise<number> {
  const result = await executeSql(
    `INSERT INTO depenses (categorie_id, montant, description, date)
     VALUES (?, ?, ?, ?)`,
    [depense.categorie_id, depense.montant, depense.description || '', depense.date]
  );
  console.log('✅ Dépense ajoutée, id:', result.lastInsertRowId);
  return result.lastInsertRowId;
}

// Modifier une dépense existante (seulement les champs fournis)
export async function modifierDepense(
  id: number,
  depense: Partial<NouvelleDepense>
): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];
  
  if (depense.categorie_id !== undefined) {
    updates.push('categorie_id = ?');
    values.push(depense.categorie_id);
  }
  if (depense.montant !== undefined) {
    updates.push('montant = ?');
    values.push(depense.montant);
  }
  if (depense.description !== undefined) {
    updates.push('description = ?');
    values.push(depense.description || '');
  }
  if (depense.date !== undefined) {
    updates.push('date = ?');
    values.push(depense.date);
  }
  
  if (updates.length === 0) return;
  
  values.push(id);
  await executeSql(
    `UPDATE depenses SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  console.log('✅ Dépense modifiée, id:', id);
}

// Supprimer une dépense de la base de données
export async function supprimerDepense(id: number): Promise<void> {
  await executeSql('DELETE FROM depenses WHERE id = ?', [id]);
  console.log('✅ Dépense supprimée, id:', id);
}

// Récupérer toutes les dépenses avec les informations de la catégorie
export async function getToutesDepenses(): Promise<DepenseAvecCategorie[]> {
  return await executeSql<DepenseAvecCategorie[]>(
    `SELECT
       d.id, d.categorie_id, d.montant, d.description,
       d.date, d.created_at,
       c.nom     AS categorie_nom,
       c.icone   AS categorie_icone,
       c.couleur AS categorie_couleur
     FROM depenses d
     JOIN categories c ON d.categorie_id = c.id
     ORDER BY d.date DESC`
  );
}

// Récupérer les dépenses d'un mois et d'une année donnés
export async function getDepensesParMois(
  mois: number,
  annee: number
): Promise<DepenseAvecCategorie[]> {
  return await executeSql<DepenseAvecCategorie[]>(
    `SELECT
       d.id, d.categorie_id, d.montant, d.description,
       d.date, d.created_at,
       c.nom     AS categorie_nom,
       c.icone   AS categorie_icone,
       c.couleur AS categorie_couleur
     FROM depenses d
     JOIN categories c ON d.categorie_id = c.id
     WHERE strftime('%m', d.date) = ?
       AND strftime('%Y', d.date) = ?
     ORDER BY d.date DESC`,
    [String(mois).padStart(2, '0'), String(annee)]
  );
}

// Récupérer toutes les dépenses d'une catégorie
export async function getDepensesParCategorie(
  categorie_id: number
): Promise<Depense[]> {
  return await executeSql<Depense[]>(
    `SELECT * FROM depenses
     WHERE categorie_id = ?
     ORDER BY date DESC`,
    [categorie_id]
  );
}

// Calculer le total des dépenses pour un mois donné
export async function getTotalDepensesParMois(
  mois: number,
  annee: number
): Promise<number> {
  
  const result = await executeSql<{ total: number }[]>(
    `SELECT COALESCE(SUM(montant), 0) AS total
     FROM depenses
     WHERE strftime('%m', date) = ?
       AND strftime('%Y', date) = ?`,
    [String(mois).padStart(2, '0'), String(annee)]
  );
  return result[0]?.total ?? 0;
}

// Calculer le total des dépenses d'une catégorie pour un mois donné
export async function getTotalParCategorieEtMois(
  categorie_id: number,
  mois: number,
  annee: number
): Promise<number> {
  const result = await executeSql<{ total: number }[]>(
    `SELECT COALESCE(SUM(montant), 0) AS total
     FROM depenses
     WHERE categorie_id = ?
       AND strftime('%m', date) = ?
       AND strftime('%Y', date) = ?`,
    [categorie_id, String(mois).padStart(2, '0'), String(annee)]
  );
  return result[0]?.total ?? 0;
}

// Calculer le total des dépenses par catégorie pour un mois
export async function getTotauxParCategorie(
  mois: number,
  annee: number
): Promise<{ categorie_nom: string; categorie_icone: string; categorie_couleur: string; total: number }[]> {
  return await executeSql<any[]>(
    `SELECT
       c.nom     AS categorie_nom,
       c.icone   AS categorie_icone,
       c.couleur AS categorie_couleur,
       COALESCE(SUM(d.montant), 0) AS total
     FROM categories c
     LEFT JOIN depenses d
       ON d.categorie_id = c.id
       AND strftime('%m', d.date) = ?
       AND strftime('%Y', d.date) = ?
     GROUP BY c.id
     ORDER BY total DESC`,
    [String(mois).padStart(2, '0'), String(annee)]
  );
}

// Calculer le solde restant (budget total - dépenses totales)
export async function getSoldeRestant(
  mois: number,
  annee: number
): Promise<{ total_budget: number; total_depense: number; solde: number }> {
  const result = await executeSql<any[]>(
    `SELECT
       COALESCE(SUM(b.montant_limite), 0) AS total_budget,
       COALESCE(SUM(d.montant), 0)        AS total_depense,
       COALESCE(SUM(b.montant_limite), 0) - COALESCE(SUM(d.montant), 0) AS solde
     FROM budgets b
     LEFT JOIN depenses d
       ON d.categorie_id = b.categorie_id
       AND strftime('%m', d.date) = ?
       AND strftime('%Y', d.date) = ?
     WHERE b.mois = ? AND b.annee = ?`,
    [String(mois).padStart(2, '0'), String(annee), mois, annee]
  );
  return result[0] ?? { total_budget: 0, total_depense: 0, solde: 0 };
}