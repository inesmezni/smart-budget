import { executeSql } from './database';

// Catégories par défaut à insérer lors de l'initialisation
const DEFAULT_CATEGORIES = [
  { nom: 'Alimentation', icone: '🍔', couleur: '#F59E0B' },
  { nom: 'Transport', icone: '🚗', couleur: '#3B82F6' },
  { nom: 'Loisirs', icone: '🎮', couleur: '#10B981' },
  { nom: 'Santé', icone: '🏥', couleur: '#EF4444' },
  { nom: 'Logement', icone: '🏠', couleur: '#8B5CF6' },
];

export async function migrateDatabase(): Promise<void> {
  // Activation des clés étrangères pour l'intégrité des données
  await executeSql('PRAGMA foreign_keys = ON;');

  // Création de la table des catégories
  await executeSql(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      icone TEXT,
      couleur TEXT NOT NULL
    );
  `);
  
  // Création de la table des budgets mensuels
  await executeSql(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categorie_id INTEGER NOT NULL,
      montant_limite REAL NOT NULL,
      mois INTEGER NOT NULL,
      annee INTEGER NOT NULL,
      FOREIGN KEY (categorie_id) REFERENCES categories(id)
    );
  `);

  // Création de la table des dépenses
  await executeSql(`
    CREATE TABLE IF NOT EXISTS depenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categorie_id INTEGER NOT NULL,
      montant REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categorie_id) REFERENCES categories(id)
    );
  `);

  // Création de la table des alertes
  await executeSql(`
    CREATE TABLE IF NOT EXISTS alertes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      budget_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      lu INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (budget_id) REFERENCES budgets(id)
    );
  `);

  // Insertion des catégories par défaut si la table est vide
  await seedCategories();
}

// Fonction pour insérer les catégories par défaut
async function seedCategories(): Promise<void> {
  try {
    // Vérification si des catégories existent déjà
    const result = await executeSql<{ count: number }[]>(
      'SELECT COUNT(*) AS count FROM categories'
    );
    const count = result?.[0]?.count ?? 0;

    // Insertion seulement si la table est vide
    if (count === 0) {
      for (const category of DEFAULT_CATEGORIES) {
        await executeSql(
          'INSERT INTO categories (nom, icone, couleur) VALUES (?, ?, ?)',
          [category.nom, category.icone, category.couleur]
        );
      }
      console.log('✅ Seed data: 5 catégories créées par défaut');
    }
  } catch (error) {
    console.error('❌ Erreur lors du seed des catégories:', error);
  }
}
