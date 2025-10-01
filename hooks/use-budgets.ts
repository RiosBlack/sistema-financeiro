import { useState, useEffect } from 'react';
import { Budget, CreateBudgetRequest } from '@/types/api';

interface UseBudgetsOptions {
  month?: number;
  year?: number;
}

export function useBudgets(options?: UseBudgetsOptions) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (options?.month) params.append('month', options.month.toString());
      if (options?.year) params.append('year', options.year.toString());

      const response = await fetch(`/api/budgets?${params.toString()}`);
      if (!response.ok) throw new Error('Erro ao buscar orçamentos');
      const data = await response.json();
      setBudgets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [options?.month, options?.year]);

  const createBudget = async (data: CreateBudgetRequest) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao criar orçamento');
      const newBudget = await response.json();
      setBudgets(prev => [newBudget, ...prev]);
      return newBudget;
    } catch (err) {
      throw err;
    }
  };

  const updateBudget = async (id: string, amount: number) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error('Erro ao atualizar orçamento');
      const updated = await response.json();
      setBudgets(prev => prev.map(b => b.id === id ? updated : b));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar orçamento');
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets,
  };
}

