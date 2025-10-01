import { create } from 'zustand';
import { Goal } from '@/types/api';

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, goal: Goal) => void;
  removeGoal: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchGoals: () => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  loading: false,
  error: null,

  setGoals: (goals) => set({ goals }),
  
  addGoal: (goal) => set((state) => ({ 
    goals: [goal, ...state.goals] 
  })),
  
  updateGoal: (id, goal) => set((state) => ({ 
    goals: state.goals.map(g => g.id === id ? goal : g) 
  })),
  
  removeGoal: (id) => set((state) => ({ 
    goals: state.goals.filter(g => g.id !== id) 
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/goals');
      if (!response.ok) throw new Error('Erro ao buscar metas');
      const data = await response.json();
      set({ goals: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));

