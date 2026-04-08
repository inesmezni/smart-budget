import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabaseSync('smart-budget.db');


// Gère automatiquement la distinction entre SELECT et autres opérations
export async function executeSql<T = any>(
  sql: string,
  params: any[] = []
): Promise<T> {
  try {
    
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const result = await db.getAllAsync<T>(sql, params);
      return result as T;
    } else {
      
      const result = await db.runAsync(sql, params);
      return result as unknown as T;
    }
  } catch (error) {
    
    console.error('SQL Error:', sql, error);
    throw error;
  }
}


export default db;
