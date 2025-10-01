import { create } from 'zustand';
import { BankAccount } from '@/types/api';

interface BankAccountsState {
  accounts: BankAccount[];
  loading: boolean;
  error: string | null;
  setAccounts: (accounts: BankAccount[]) => void;
  addAccount: (account: BankAccount) => void;
  updateAccount: (id: string, account: BankAccount) => void;
  removeAccount: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchAccounts: () => Promise<void>;
}

export const useBankAccountsStore = create<BankAccountsState>((set) => ({
  accounts: [],
  loading: false,
  error: null,

  setAccounts: (accounts) => set({ accounts }),
  
  addAccount: (account) => set((state) => ({ 
    accounts: [account, ...state.accounts] 
  })),
  
  updateAccount: (id, account) => set((state) => ({ 
    accounts: state.accounts.map(a => a.id === id ? account : a) 
  })),
  
  removeAccount: (id) => set((state) => ({ 
    accounts: state.accounts.filter(a => a.id !== id) 
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/bank-accounts');
      if (!response.ok) throw new Error('Erro ao buscar contas');
      const data = await response.json();
      set({ accounts: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));

