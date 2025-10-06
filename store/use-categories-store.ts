import { create } from 'zustand';
import { Category, TransactionType } from '@/types/api';

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Category) => void;
  removeCategory: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchCategories: (type?: TransactionType) => Promise<void>;
  getCategoriesByType: (type: TransactionType) => Category[];
  createCategory: (data: { name: string; icon?: string; color?: string; type: TransactionType }) => Promise<Category>;
  editCategory: (id: string, data: { name?: string; icon?: string; color?: string }) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  setCategories: (categories) => set({ categories }),
  
  addCategory: (category) => set((state) => ({ 
    categories: [category, ...state.categories] 
  })),
  
  updateCategory: (id, category) => set((state) => ({ 
    categories: state.categories.map(c => c.id === id ? category : c) 
  })),
  
  removeCategory: (id) => set((state) => ({ 
    categories: state.categories.filter(c => c.id !== id) 
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  fetchCategories: async (type?: TransactionType) => {
    set({ loading: true, error: null });
    try {
      const url = type ? `/api/categories?type=${type}` : '/api/categories';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar categorias');
      const data = await response.json();
      set({ categories: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getCategoriesByType: (type: TransactionType) => {
    return get().categories.filter(c => c.type === type);
  },

  createCategory: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar categoria');
      }
      
      const category = await response.json();
      set((state) => ({ 
        categories: [category, ...state.categories],
        loading: false 
      }));
      return category;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  editCategory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao editar categoria');
      }
      
      const category = await response.json();
      set((state) => ({ 
        categories: state.categories.map(c => c.id === id ? category : c),
        loading: false 
      }));
      return category;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar categoria');
      }
      
      set((state) => ({ 
        categories: state.categories.filter(c => c.id !== id),
        loading: false 
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));

