import { create } from 'zustand';
import { Transaction, TransactionFilters } from '@/types/api';

interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: TransactionFilters;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: TransactionFilters) => void;
  fetchTransactions: () => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  },
  filters: {},

  setTransactions: (transactions) => set({ transactions }),
  
  addTransaction: (transaction) => set((state) => ({ 
    transactions: [transaction, ...state.transactions] 
  })),
  
  updateTransaction: (id, transaction) => set((state) => ({ 
    transactions: state.transactions.map(t => t.id === id ? transaction : t) 
  })),
  
  removeTransaction: (id) => set((state) => ({ 
    transactions: state.transactions.filter(t => t.id !== id) 
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  setFilters: (filters) => set({ filters }),

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.bankAccountId) params.append('bankAccountId', filters.bankAccountId);
      if (filters.cardId) params.append('cardId', filters.cardId);
      if (filters.isPaid !== undefined) params.append('isPaid', filters.isPaid.toString());
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (!response.ok) throw new Error('Erro ao buscar transações');
      const data = await response.json();
      set({ 
        transactions: data.transactions, 
        pagination: data.pagination,
        loading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));

