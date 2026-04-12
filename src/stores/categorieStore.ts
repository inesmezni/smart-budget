import { create } from 'zustand';
import { Categorie } from '../models';
import { getToutesCategories } from '../db/repositories/categorieRepo';

interface CategorieStore {
  categories: Categorie[];
  isLoading: boolean;
  chargerCategories: () => Promise<void>;
}

export const useCategorieStore = create<CategorieStore>((set) => ({
  categories: [],
  isLoading: false,

  chargerCategories: async () => {
    set({ isLoading: true });
    try {
      const categories = await getToutesCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      console.error('❌ Erreur chargement catégories:', error);
      set({ isLoading: false });
    }
  },
}));
