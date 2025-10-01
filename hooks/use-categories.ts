import { useState, useEffect } from 'react';
import { Category, CreateCategoryRequest, TransactionType } from '@/types/api';

export function useCategories(type?: TransactionType) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const url = type ? `/api/categories?type=${type}` : '/api/categories';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar categorias');
      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const createCategory = async (data: CreateCategoryRequest) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao criar categoria');
      const newCategory = await response.json();
      setCategories(prev => [newCategory, ...prev]);
      return newCategory;
    } catch (err) {
      throw err;
    }
  };

  const updateCategory = async (id: string, data: Partial<CreateCategoryRequest>) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao atualizar categoria');
      const updated = await response.json();
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar categoria');
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
}

