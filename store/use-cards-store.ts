import { create } from 'zustand';
import { Card } from '@/types/api';

interface CardsState {
  cards: Card[];
  loading: boolean;
  error: string | null;
  setCards: (cards: Card[]) => void;
  addCard: (card: Card) => void;
  updateCard: (id: string, card: Card) => void;
  removeCard: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchCards: () => Promise<void>;
}

export const useCardsStore = create<CardsState>((set) => ({
  cards: [],
  loading: false,
  error: null,

  setCards: (cards) => set({ cards }),
  
  addCard: (card) => set((state) => ({ 
    cards: [card, ...state.cards] 
  })),
  
  updateCard: (id, card) => set((state) => ({ 
    cards: state.cards.map(c => c.id === id ? card : c) 
  })),
  
  removeCard: (id) => set((state) => ({ 
    cards: state.cards.filter(c => c.id !== id) 
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  fetchCards: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/cards');
      if (!response.ok) throw new Error('Erro ao buscar cartões');
      const data = await response.json();
      set({ cards: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));

