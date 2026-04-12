export interface MonthYear {
  mois: number;
  annee: number;
}

// Retourne un objet Date à partir d'une chaîne ou d'une Date
export function parseDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

// Retourne le mois et l'année d'une date
export function getMonthYear(value: string | Date): MonthYear {
  const date = parseDate(value);
  return {
    mois: date.getMonth() + 1,
    annee: date.getFullYear(),
  };
}

// Vérifie si une date correspond à un mois et une année donnés
export function isSameMonthYear(
  value: string | Date,
  mois: number,
  annee: number
): boolean {
  const date = parseDate(value);
  return date.getMonth() + 1 === mois && date.getFullYear() === annee;
}

// Formate un mois/année en chaîne lisible
export function formatMonthYear(mois: number, annee: number): string {
  return `${String(mois).padStart(2, '0')}/${annee}`;
}

// Retourne le mois et l'année courants
export function getCurrentMonthYear(): MonthYear {
  const today = new Date();
  return {
    mois: today.getMonth() + 1,
    annee: today.getFullYear(),
  };
}
