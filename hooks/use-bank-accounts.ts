import { useState, useEffect } from 'react';
import { BankAccount, CreateBankAccountRequest } from '@/types/api';

export function useBankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bank-accounts');
      if (!response.ok) throw new Error('Erro ao buscar contas');
      const data = await response.json();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const createAccount = async (data: CreateBankAccountRequest) => {
    try {
      const response = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao criar conta');
      const newAccount = await response.json();
      setAccounts(prev => [newAccount, ...prev]);
      return newAccount;
    } catch (err) {
      throw err;
    }
  };

  const updateAccount = async (id: string, data: Partial<CreateBankAccountRequest>) => {
    try {
      const response = await fetch(`/api/bank-accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao atualizar conta');
      const updated = await response.json();
      setAccounts(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const response = await fetch(`/api/bank-accounts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar conta');
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    refetch: fetchAccounts,
  };
}

