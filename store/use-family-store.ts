import { create } from "zustand";
import { toast } from "sonner";
import type { Family, FamilyInvitation } from "@/types/family";

interface FamilyStore {
  family: Family | null;
  userRole: "OWNER" | "MEMBER" | null;
  invitations: FamilyInvitation[];
  pendingInvitationsCount: number;
  isLoading: boolean;
  error: string | null;

  fetchFamily: () => Promise<void>;
  createFamily: (name: string) => Promise<Family>;
  leaveFamily: () => Promise<void>;
  fetchInvitations: () => Promise<void>;
  inviteMember: (email: string) => Promise<void>;
  acceptInvitation: (id: string) => Promise<void>;
  rejectInvitation: (id: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  toggleShare: (
    type: "bankAccount" | "card" | "category" | "transaction",
    itemId: string,
    shared: boolean
  ) => Promise<void>;
}

export const useFamilyStore = create<FamilyStore>((set, get) => ({
  family: null,
  userRole: null,
  invitations: [],
  pendingInvitationsCount: 0,
  isLoading: false,
  error: null,

  fetchFamily: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/family");
      if (!response.ok) {
        throw new Error("Erro ao buscar família");
      }
      const data = await response.json();
      set({
        family: data.family,
        userRole: data.userRole || null,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar família";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  createFamily: async (name: string) => {
    try {
      const response = await fetch("/api/family", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar família");
      }

      const family = await response.json();
      set({ family, userRole: "OWNER" });
      toast.success("Família criada com sucesso!");
      return family;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar família";
      toast.error(message);
      throw error;
    }
  },

  leaveFamily: async () => {
    try {
      const response = await fetch("/api/family", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao sair da família");
      }

      set({ family: null, userRole: null });
      toast.success("Você saiu da família com sucesso");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao sair da família";
      toast.error(message);
      throw error;
    }
  },

  fetchInvitations: async () => {
    try {
      const response = await fetch("/api/family/invitations");
      if (!response.ok) {
        throw new Error("Erro ao buscar convites");
      }
      const invitations = await response.json();
      set({
        invitations,
        pendingInvitationsCount: invitations.length,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar convites";
      toast.error(message);
    }
  },

  inviteMember: async (email: string) => {
    try {
      const response = await fetch("/api/family/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao enviar convite");
      }

      toast.success("Convite enviado com sucesso!");
      // Recarregar família para atualizar contadores
      await get().fetchFamily();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao enviar convite";
      toast.error(message);
      throw error;
    }
  },

  acceptInvitation: async (id: string) => {
    try {
      const response = await fetch(`/api/family/invitations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "accept" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao aceitar convite");
      }

      toast.success("Convite aceito com sucesso!");
      // Remover convite da lista e recarregar família
      set((state) => ({
        invitations: state.invitations.filter((inv) => inv.id !== id),
        pendingInvitationsCount: state.pendingInvitationsCount - 1,
      }));
      await get().fetchFamily();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao aceitar convite";
      toast.error(message);
      throw error;
    }
  },

  rejectInvitation: async (id: string) => {
    try {
      const response = await fetch(`/api/family/invitations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reject" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao rejeitar convite");
      }

      toast.success("Convite rejeitado");
      // Remover convite da lista
      set((state) => ({
        invitations: state.invitations.filter((inv) => inv.id !== id),
        pendingInvitationsCount: state.pendingInvitationsCount - 1,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao rejeitar convite";
      toast.error(message);
      throw error;
    }
  },

  removeMember: async (memberId: string) => {
    try {
      const response = await fetch(`/api/family/members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao remover membro");
      }

      toast.success("Membro removido com sucesso");
      // Recarregar família
      await get().fetchFamily();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao remover membro";
      toast.error(message);
      throw error;
    }
  },

  toggleShare: async (
    type: "bankAccount" | "card" | "category" | "transaction",
    itemId: string,
    shared: boolean
  ) => {
    try {
      const response = await fetch("/api/family/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, itemId, shared }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao compartilhar item");
      }

      toast.success(
        shared
          ? "Item compartilhado com sucesso"
          : "Compartilhamento removido"
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao compartilhar item";
      toast.error(message);
      throw error;
    }
  },
}));

