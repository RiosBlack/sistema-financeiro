import { useState, useEffect } from 'react';
import { Transaction, CreateTransactionRequest, TransactionFilters } from '@/types/api';

export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters?.type) params.append('type', filters.type);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.bankAccountId) params.append('bankAccountId', filters.bankAccountId);
      if (filters?.cardId) params.append('cardId', filters.cardId);
      if (filters?.isPaid !== undefined) params.append('isPaid', filters.isPaid.toString());
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (!response.ok) throw new Error('Erro ao buscar transações');
      const data = await response.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [
    filters?.type,
    filters?.categoryId,
    filters?.bankAccountId,
    filters?.cardId,
    filters?.isPaid,
    filters?.startDate,
    filters?.endDate,
    filters?.page,
    filters?.limit,
  ]);

  const createTransaction = async (data: CreateTransactionRequest) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao criar transação');
      const result = await response.json();
      await fetchTransactions(); // Recarregar lista
      return result;
    } catch (err) {
      throw err;
    }
  };

  const updateTransaction = async (id: string, data: Partial<CreateTransactionRequest>) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao atualizar transação');
      const updated = await response.json();
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar transação');
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    pagination,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}

