import { create } from "zustand";
import { toast } from "sonner";

export interface Role {
  id: string;
  name: string;
  description: string | null;
  _count?: {
    users: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  role: Role | null;
  _count?: {
    transactions: number;
    bankAccounts: number;
    cards: number;
    goals: number;
  };
}

interface UsersStore {
  users: User[];
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  createUser: (data: {
    name: string;
    email: string;
    password: string;
    roleId?: string;
  }) => Promise<User>;
  updateUser: (
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      roleId?: string;
    }
  ) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  roles: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Erro ao buscar usuários");
      }
      const users = await response.json();
      set({ users, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar usuários";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  fetchRoles: async () => {
    try {
      const response = await fetch("/api/roles");
      if (!response.ok) {
        throw new Error("Erro ao buscar roles");
      }
      const roles = await response.json();
      set({ roles });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar roles";
      toast.error(message);
    }
  },

  createUser: async (data) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar usuário");
      }

      const newUser = await response.json();
      set((state) => ({
        users: [newUser, ...state.users],
      }));

      toast.success("Usuário criado com sucesso!");
      return newUser;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar usuário";
      toast.error(message);
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar usuário");
      }

      const updatedUser = await response.json();
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? updatedUser : user
        ),
      }));

      toast.success("Usuário atualizado com sucesso!");
      return updatedUser;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao atualizar usuário";
      toast.error(message);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir usuário");
      }

      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));

      toast.success("Usuário excluído com sucesso!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao excluir usuário";
      toast.error(message);
      throw error;
    }
  },
}));

