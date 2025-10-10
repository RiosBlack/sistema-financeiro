import { create } from "zustand";
import { toast } from "sonner";
import type { BankAccount, Card, Transaction, Goal, Category } from "@/types/api";

export interface MemberData {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  accounts: BankAccount[];
  cards: Card[];
  transactions: Transaction[];
  goals: Goal[];
  categories: Category[];
}

interface MemberViewStore {
  memberData: MemberData | null;
  selectedMemberId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchMemberData: (userId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  clearMemberData: () => void;
}

export const useMemberViewStore = create<MemberViewStore>((set) => ({
  memberData: null,
  selectedMemberId: null,
  isLoading: false,
  error: null,

  fetchMemberData: async (userId: string, filters = {}) => {
    set({ isLoading: true, error: null, selectedMemberId: userId });
    try {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const queryString = queryParams.toString();
      const url = `/api/family/members/${userId}/data${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao buscar dados do membro");
      }

      const data = await response.json();
      set({ memberData: data, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao buscar dados do membro";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  clearMemberData: () => {
    set({
      memberData: null,
      selectedMemberId: null,
      isLoading: false,
      error: null,
    });
  },
}));

