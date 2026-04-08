import { executeSql } from '../database';
import { Budget, NouveauBudget, BudgetAvecCategorie } from '../../models';

// Ajouter un nouveau budget à la base de données
export async function ajouterBudget(budget: NouveauBudget): Promise<number> {
  const result = await executeSql(
    `INSERT INTO budgets (categorie_id, montant_limite, mois, annee)
     VALUES (?, ?, ?, ?)`,
    [budget.categorie_id, budget.montant_limite, budget.mois, budget.annee]
  );
  console.log('✅ Budget ajouté, id:', result.lastInsertRowId);
  return result.lastInsertRowId;
}

// Modifier un budget existant (seulement les champs fournis)
export async function modifierBudget(
  id: number,
  budget: Partial<NouveauBudget>
): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];
  
  if (budget.montant_limite !== undefined) {
    updates.push('montant_limite = ?');
    values.push(budget.montant_limite);
  }
  if (budget.categorie_id !== undefined) {
    updates.push('categorie_id = ?');
    values.push(budget.categorie_id);
  }
  if (budget.mois !== undefined) {
    updates.push('mois = ?');
    values.push(budget.mois);
  }
  if (budget.annee !== undefined) {
    updates.push('annee = ?');
    values.push(budget.annee);
  }
  
  if (updates.length === 0) return;
  
  values.push(id);
  await executeSql(
    `UPDATE budgets SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  console.log('✅ Budget modifié, id:', id);
}

// Supprimer un budget de la base de données
export async function supprimerBudget(id: number): Promise<void> {
  await executeSql('DELETE FROM budgets WHERE id = ?', [id]);
  console.log('✅ Budget supprimé, id:', id);
}

// Récupérer un budget par son ID
export async function getBudgetById(id: number): Promise<Budget | null> {
  const result = await executeSql<Budget[]>(
    'SELECT * FROM budgets WHERE id = ?',
    [id]
  );
  return result[0] ?? null;
}

// Récupérer tous les budgets d'un mois avec le total des dépenses et pourcentage
export async function getBudgetsParMois(
  mois: number,
  annee: number
): Promise<BudgetAvecCategorie[]> {
  return await executeSql<BudgetAvecCategorie[]>(
    `SELECT
       b.id, b.categorie_id, b.montant_limite, b.mois, b.annee,
       c.nom     AS categorie_nom,
       c.icone   AS categorie_icone,
       c.couleur AS categorie_couleur,
       COALESCE(SUM(d.montant), 0) AS montant_depense,
       ROUND(COALESCE(SUM(d.montant), 0) * 100.0 / b.montant_limite, 1) AS pourcentage
     FROM budgets b
     JOIN categories c ON b.categorie_id = c.id
     LEFT JOIN depenses d
       ON d.categorie_id = b.categorie_id
       AND strftime('%m', d.date) = ?
       AND strftime('%Y', d.date) = ?
     WHERE b.mois = ? AND b.annee = ?
     GROUP BY b.id`,
    [String(mois).padStart(2, '0'), String(annee), mois, annee]
  );
}

// Récupérer le budget d'une catégorie pour un mois donné
export async function getBudgetParCategorie(
  categorie_id: number,
  mois: number,
  annee: number
): Promise<Budget | null> {
  const result = await executeSql<Budget[]>(
    `SELECT * FROM budgets
     WHERE categorie_id = ? AND mois = ? AND annee = ?`,
    [categorie_id, mois, annee]
  );
  return result[0] ?? null;
}