"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Users, Mail, Calendar, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserForm } from "@/components/forms/user-form";
import { useUsersStore, type User } from "@/store/use-users-store";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { users, isLoading, fetchUsers, deleteUser } = useUsersStore();
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });

  // Verificar se o usuário é admin
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/login");
      return;
    }

    // Debug: verificar estrutura da sessão
    console.log("Session completa:", session);
    console.log("User:", session.user);
    console.log("Role:", session.user?.role);

    // Verificar se o role é admin
    const userRole = session.user?.role?.name;
    console.log("User role name:", userRole);
    
    if (userRole?.toLowerCase() !== "admin") {
      console.log("Não é admin, redirecionando...");
      router.push("/dashboard");
      return;
    }

    console.log("É admin! Buscando usuários...");
    fetchUsers();
  }, [fetchUsers, status, session, router]);

  // Debug: verificar estado dos usuários
  console.log("Users state:", users);
  console.log("Is loading:", isLoading);
  console.log("Users length:", users?.length);

  // Mostrar loading enquanto verifica autenticação
  if (status === "loading" || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Verificar se tem permissão
  const userRole = session?.user?.role?.name;
  if (userRole?.toLowerCase() !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">Acesso Negado</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar usuários do sistema.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDelete = async () => {
    if (!deleteDialog.user) return;

    try {
      await deleteUser(deleteDialog.user.id);
      setDeleteDialog({ open: false, user: null });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
    }
  };

  const handleFormSuccess = () => {
    setShowUserForm(false);
    setEditingUser(undefined);
    fetchUsers();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e configurações do sistema
          </p>
        </div>
      </div>

      {/* Gerenciamento de Usuários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários
              </CardTitle>
              <CardDescription>
                Cadastre e gerencie os usuários do sistema
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingUser(undefined);
                setShowUserForm(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum usuário</h3>
              <p className="text-muted-foreground">
                Comece criando um novo usuário
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Cadastrado em</TableHead>
                    <TableHead>Dados</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.role ? (
                          <Badge variant="outline">{user.role.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Sem perfil
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          {user._count && (
                            <>
                              <span>
                                {user._count.transactions} transações
                              </span>
                              <span>
                                {user._count.cards} cartões
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteDialog({ open: true, user })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Formulário */}
      <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Atualize as informações do usuário"
                : "Preencha os dados para criar um novo usuário"}
            </DialogDescription>
          </DialogHeader>
          <UserForm user={editingUser} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, user: deleteDialog.user })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>
                  Tem certeza que deseja excluir o usuário{" "}
                  <strong>{deleteDialog.user?.name}</strong>?
                </p>
                {deleteDialog.user?._count &&
                  (deleteDialog.user._count.transactions > 0 ||
                    deleteDialog.user._count.cards > 0) && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-900">
                      <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                        ⚠️ Este usuário possui dados associados e não pode ser
                        excluído.
                      </p>
                    </div>
                  )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={
                deleteDialog.user?._count &&
                (deleteDialog.user._count.transactions > 0 ||
                  deleteDialog.user._count.cards > 0)
              }
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

