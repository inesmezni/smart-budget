import { executeSql } from '../database';
import { Alerte, NouvelleAlerte, AlerteAvecBudget } from '../../models';

// Ajouter une nouvelle alerte à la base de données
export async function ajouterAlerte(alerte: NouvelleAlerte): Promise<number> {
  const result = await executeSql(
    `INSERT INTO alertes (budget_id, type)
     VALUES (?, ?)`,
    [alerte.budget_id, alerte.type]
  );
  console.log('✅ Alerte ajoutée, id:', result.lastInsertRowId);
  return result.lastInsertRowId;
}

// Récupérer une alerte par son ID
export async function getAlerteById(id: number): Promise<Alerte | null> {
  const result = await executeSql<Alerte[]>(
    'SELECT * FROM alertes WHERE id = ?',
    [id]
  );
  return result[0] ?? null;
}


// Récupérer toutes les alertes avec les détails du budget associé
export async function getToutesAlertes(): Promise<AlerteAvecBudget[]> {
  return await executeSql<AlerteAvecBudget[]>(
    `SELECT
       a.id, a.budget_id, a.type, a.lu, a.created_at,
       c.nom     AS categorie_nom,
       c.icone   AS categorie_icone,
       b.montant_limite,
       COALESCE(SUM(d.montant), 0) AS montant_depense,
       ROUND(COALESCE(SUM(d.montant), 0) * 100.0 / b.montant_limite, 1) AS pourcentage
     FROM alertes a
     JOIN budgets b    ON a.budget_id = b.id
     JOIN categories c ON b.categorie_id = c.id
     LEFT JOIN depenses d
       ON d.categorie_id = b.categorie_id
       AND strftime('%m', d.date) = printf('%02d', b.mois)
       AND strftime('%Y', d.date) = CAST(b.annee AS TEXT)
     GROUP BY a.id
     ORDER BY a.created_at DESC`
  );
}

// Récupérer seulement les alertes non lues
export async function getAlertesNonLues(): Promise<AlerteAvecBudget[]> {
  return await executeSql<AlerteAvecBudget[]>(
    `SELECT
       a.id, a.budget_id, a.type, a.lu, a.created_at,
       c.nom     AS categorie_nom,
       c.icone   AS categorie_icone,
       b.montant_limite,
       COALESCE(SUM(d.montant), 0) AS montant_depense,
       ROUND(COALESCE(SUM(d.montant), 0) * 100.0 / b.montant_limite, 1) AS pourcentage
     FROM alertes a
     JOIN budgets b    ON a.budget_id = b.id
     JOIN categories c ON b.categorie_id = c.id
     LEFT JOIN depenses d
       ON d.categorie_id = b.categorie_id
       AND strftime('%m', d.date) = printf('%02d', b.mois)
       AND strftime('%Y', d.date) = CAST(b.annee AS TEXT)
     WHERE a.lu = 0
     GROUP BY a.id
     ORDER BY a.created_at DESC`
  );
}

// Marquer une alerte comme lue
export async function marquerAlerteLue(id: number): Promise<void> {
  await executeSql('UPDATE alertes SET lu = 1 WHERE id = ?', [id]);
  console.log('✅ Alerte marquée lue, id:', id);
}

// Marquer toutes les alertes comme lues
export async function marquerToutesAlertesLues(): Promise<void> {
  await executeSql('UPDATE alertes SET lu = 1 WHERE lu = 0');
  console.log('✅ Toutes les alertes marquées lues');
}

// Supprimer une alerte de la base de données
export async function supprimerAlerte(id: number): Promise<void> {
  await executeSql('DELETE FROM alertes WHERE id = ?', [id]);
  console.log('✅ Alerte supprimée, id:', id);
}

// ── Vérifier si alerte existe déjà ──────────────────
export async function alerteExisteDeja(
  budget_id: number,
  type: string
): Promise<boolean> {
  const result = await executeSql<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM alertes
     WHERE budget_id = ? AND type = ? AND lu = 0`,
    [budget_id, type]
  );
  return (result[0]?.count ?? 0) > 0;
}

// ── Nettoyer les doublons existants ──────────────────
export async function nettoyerAlertesDupliquees(): Promise<void> {
  await executeSql(`
    DELETE FROM alertes
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM alertes
      GROUP BY budget_id, type, lu
    )
  `);
  console.log('✅ Alertes dupliquées supprimées');
}