"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsersStore, type User } from "@/store/use-users-store";
import { useEffect } from "react";

const userSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
  roleId: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User;
  onSuccess?: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const { createUser, updateUser, roles, fetchRoles } = useUsersStore();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      roleId: user?.role?.id || "",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      // Remover password e roleId se estiverem vazios
      const submitData = {
        ...data,
        password: data.password || undefined,
        roleId: data.roleId && data.roleId !== "" ? data.roleId : undefined,
      };

      if (user) {
        await updateUser(user.id, submitData);
      } else {
        // Para criação, senha é obrigatória
        if (!data.password) {
          form.setError("password", {
            message: "Senha é obrigatória para novo usuário",
          });
          return;
        }
        await createUser(submitData as { name: string; email: string; password: string; roleId?: string });
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      // Mostrar mensagem de erro específica se disponível
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao salvar usuário");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Senha {user && "(deixe em branco para não alterar)"}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={user ? "••••••••" : "Senha"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perfil (Opcional)</FormLabel>
              <Select
                onValueChange={(value) => {
                  // Se selecionar "none", limpar o campo
                  field.onChange(value === "none" ? "" : value);
                }}
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum (sem perfil)</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                      {role.description && ` - ${role.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            {user ? "Atualizar" : "Criar"} Usuário
          </Button>
        </div>
      </form>
    </Form>
  );
}

