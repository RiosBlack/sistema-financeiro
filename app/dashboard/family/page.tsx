"use client";

import { useEffect, useState } from "react";
import { useFamilyStore } from "@/store/use-family-store";
import { useBankAccountsStore } from "@/store/use-bank-accounts-store";
import { useCardsStore } from "@/store/use-cards-store";
import { useCategoriesStore } from "@/store/use-categories-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, UserPlus, UserMinus, Crown, LogOut, Wallet, CreditCard, Tag, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function FamilyPage() {
  const { data: session } = useSession();
  const { family, userRole, fetchFamily, createFamily, inviteMember, removeMember, leaveFamily, toggleShare } = useFamilyStore();
  const { accounts, fetchAccounts } = useBankAccountsStore();
  const { cards, fetchCards } = useCardsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; memberId: string | null; memberName: string | null }>({ open: false, memberId: null, memberName: null });
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadFamily = async () => {
      setLoading(true);
      await fetchFamily();
      setLoading(false);
    };
    loadFamily();
  }, [fetchFamily]);

  // Carregar dados financeiros quando estiver em uma família
  useEffect(() => {
    if (family) {
      fetchAccounts();
      fetchCards();
      fetchCategories();
    }
  }, [family, fetchAccounts, fetchCards, fetchCategories]);

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      toast.error("Digite um nome para a família");
      return;
    }

    setSubmitting(true);
    try {
      await createFamily(familyName);
      setCreateDialog(false);
      setFamilyName("");
    } catch (error) {
      // Erro já tratado no store
    } finally {
      setSubmitting(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Digite um email");
      return;
    }

    setSubmitting(true);
    try {
      await inviteMember(inviteEmail);
      setInviteDialog(false);
      setInviteEmail("");
    } catch (error) {
      // Erro já tratado no store
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeDialog.memberId) return;

    setSubmitting(true);
    try {
      await removeMember(removeDialog.memberId);
      setRemoveDialog({ open: false, memberId: null, memberName: null });
    } catch (error) {
      // Erro já tratado no store
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveFamily = async () => {
    setSubmitting(true);
    try {
      await leaveFamily();
      setLeaveDialog(false);
    } catch (error) {
      // Erro já tratado no store
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleShare = async (
    type: "bankAccount" | "card" | "category" | "transaction",
    itemId: string,
    currentlyShared: boolean
  ) => {
    try {
      await toggleShare(type, itemId, !currentlyShared);
      // Recarregar dados
      if (type === "bankAccount") await fetchAccounts();
      if (type === "card") await fetchCards();
      if (type === "category") await fetchCategories();
    } catch (error) {
      // Erro já tratado no store
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Usuário não está em uma família
  if (!family) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Família</h1>
          <p className="text-muted-foreground">
            Crie uma família para compartilhar dados financeiros com outras pessoas
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Você ainda não está em uma família
            </CardTitle>
            <CardDescription>
              Crie uma família para convidar outras pessoas e compartilhar contas, cartões, transações e categorias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setCreateDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Criar Família
            </Button>
          </CardContent>
        </Card>

        {/* Dialog de criar família */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Família</DialogTitle>
              <DialogDescription>
                Escolha um nome para sua família. Você será o administrador e poderá convidar outros membros.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="familyName">Nome da Família</Label>
                <Input
                  id="familyName"
                  placeholder="Ex: Família Silva"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFamily()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialog(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleCreateFamily} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Usuário está em uma família
  const isOwner = userRole === "OWNER";
  const currentUserMember = family.members.find((m) => m.userId === session?.user?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{family.name}</h1>
          <p className="text-muted-foreground">
            Gerencie os membros da sua família e compartilhe dados financeiros
          </p>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <Button onClick={() => setInviteDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar Membro
            </Button>
          )}
          {!isOwner && (
            <Button variant="destructive" onClick={() => setLeaveDialog(true)}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Família
            </Button>
          )}
        </div>
      </div>

      {/* Card de informações */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Família</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Criado por:</span>
            <span className="font-medium">{family.createdBy.name || family.createdBy.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total de membros:</span>
            <span className="font-medium">{family.members.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Seu papel:</span>
            <Badge variant={isOwner ? "default" : "secondary"}>
              {isOwner ? "Administrador" : "Membro"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lista de membros */}
      <Card>
        <CardHeader>
          <CardTitle>Membros da Família</CardTitle>
          <CardDescription>
            {isOwner
              ? "Todos os membros podem visualizar dados compartilhados. Apenas você pode remover membros."
              : "Todos os membros podem visualizar dados compartilhados."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {family.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {member.role === "OWNER" ? (
                      <Crown className="h-5 w-5 text-primary" />
                    ) : (
                      <Users className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{member.user.name || "Sem nome"}</div>
                    <div className="text-sm text-muted-foreground">{member.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === "OWNER" ? "default" : "secondary"}>
                    {member.role === "OWNER" ? "Administrador" : "Membro"}
                  </Badge>
                  {isOwner && member.userId !== session?.user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setRemoveDialog({
                          open: true,
                          memberId: member.id,
                          memberName: member.user.name || member.user.email || "este membro",
                        })
                      }
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gerenciamento de Compartilhamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Gerenciar Compartilhamentos
          </CardTitle>
          <CardDescription>
            Escolha quais itens financeiros você deseja compartilhar com sua família
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="accounts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="accounts">
                <Wallet className="h-4 w-4 mr-2" />
                Contas
              </TabsTrigger>
              <TabsTrigger value="cards">
                <CreditCard className="h-4 w-4 mr-2" />
                Cartões
              </TabsTrigger>
              <TabsTrigger value="categories">
                <Tag className="h-4 w-4 mr-2" />
                Categorias
              </TabsTrigger>
            </TabsList>

            {/* Tab de Contas */}
            <TabsContent value="accounts" className="space-y-4">
              {accounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Você ainda não tem contas cadastradas
                </div>
              ) : (
                <div className="space-y-2">
                  {accounts
                    .filter((acc) => acc.createdById === session?.user?.id)
                    .map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: account.color || "#gray" }}
                          />
                          <div>
                            <div className="font-medium">{account.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {account.institution}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`account-${account.id}`} className="text-sm cursor-pointer">
                            {account.isShared ? "Compartilhado" : "Privado"}
                          </Label>
                          <Switch
                            id={`account-${account.id}`}
                            checked={account.isShared}
                            onCheckedChange={() =>
                              handleToggleShare("bankAccount", account.id, account.isShared)
                            }
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>

            {/* Tab de Cartões */}
            <TabsContent value="cards" className="space-y-4">
              {cards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Você ainda não tem cartões cadastrados
                </div>
              ) : (
                <div className="space-y-2">
                  {cards
                    .filter((card) => card.ownerId === session?.user?.id)
                    .map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{card.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {card.lastFourDigits ? `•••• ${card.lastFourDigits}` : "Sem número"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`card-${card.id}`} className="text-sm cursor-pointer">
                            {card.isShared ? "Compartilhado" : "Privado"}
                          </Label>
                          <Switch
                            id={`card-${card.id}`}
                            checked={card.isShared}
                            onCheckedChange={() =>
                              handleToggleShare("card", card.id, card.isShared)
                            }
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>

            {/* Tab de Categorias */}
            <TabsContent value="categories" className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Você ainda não tem categorias personalizadas
                </div>
              ) : (
                <div className="space-y-2">
                  {categories
                    .filter((cat) => cat.createdById === session?.user?.id && !cat.isDefault)
                    .map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: category.color || "#gray" }}
                          />
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {category.type === "INCOME" ? "Receita" : "Despesa"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer">
                            {category.isShared ? "Compartilhado" : "Privado"}
                          </Label>
                          <Switch
                            id={`category-${category.id}`}
                            checked={category.isShared}
                            onCheckedChange={() =>
                              handleToggleShare("category", category.id, category.isShared)
                            }
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de convidar membro */}
      <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Membro</DialogTitle>
            <DialogDescription>
              Digite o email do usuário que você deseja convidar para sua família. O usuário receberá uma notificação e poderá aceitar ou rejeitar o convite.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email do Usuário</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="usuario@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInviteMember()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialog(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleInviteMember} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de remover membro */}
      <AlertDialog open={removeDialog.open} onOpenChange={(open) => !open && setRemoveDialog({ open: false, memberId: null, memberName: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{removeDialog.memberName}</strong> da família? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de sair da família */}
      <AlertDialog open={leaveDialog} onOpenChange={setLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da Família</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair da família? Você perderá acesso a todos os dados compartilhados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveFamily} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

