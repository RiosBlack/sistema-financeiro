import { useState, useEffect } from 'react';
import { Goal, CreateGoalRequest } from '@/types/api';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/goals');
      if (!response.ok) throw new Error('Erro ao buscar metas');
      const data = await response.json();
      setGoals(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const createGoal = async (data: CreateGoalRequest) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao criar meta');
      const newGoal = await response.json();
      setGoals(prev => [newGoal, ...prev]);
      return newGoal;
    } catch (err) {
      throw err;
    }
  };

  const updateGoal = async (id: string, data: Partial<CreateGoalRequest>) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao atualizar meta');
      const updated = await response.json();
      setGoals(prev => prev.map(g => g.id === id ? updated : g));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar meta');
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const contribute = async (id: string, amount: number) => {
    try {
      const response = await fetch(`/api/goals/${id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error('Erro ao adicionar contribuição');
      const updated = await response.json();
      setGoals(prev => prev.map(g => g.id === id ? updated : g));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    contribute,
    refetch: fetchGoals,
  };
}

