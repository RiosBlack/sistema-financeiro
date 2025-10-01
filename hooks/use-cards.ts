import { useState, useEffect } from 'react';
import { Card, CreateCardRequest } from '@/types/api';

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cards');
      if (!response.ok) throw new Error('Erro ao buscar cartões');
      const data = await response.json();
      setCards(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const createCard = async (data: CreateCardRequest) => {
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao criar cartão');
      const newCard = await response.json();
      setCards(prev => [newCard, ...prev]);
      return newCard;
    } catch (err) {
      throw err;
    }
  };

  const updateCard = async (id: string, data: Partial<CreateCardRequest>) => {
    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao atualizar cartão');
      const updated = await response.json();
      setCards(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar cartão');
      setCards(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    cards,
    loading,
    error,
    createCard,
    updateCard,
    deleteCard,
    refetch: fetchCards,
  };
}

