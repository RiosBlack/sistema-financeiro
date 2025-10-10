"use client";

import { useEffect, useMemo } from "react";
import { useMemberViewStore } from "@/store/use-member-view-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, TrendingUp, TrendingDown, Target, Wallet, CreditCard } from "lucide-react";

interface MemberDashboardViewProps {
  userId: string;
}

export function MemberDashboardView({ userId }: MemberDashboardViewProps) {
  const { memberData, isLoading, fetchMemberData } = useMemberViewStore();

  useEffect(() => {
    // Buscar transações do mês atual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    fetchMemberData(userId, {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
    });
  }, [userId, fetchMemberData]);

  const metrics = useMemo(() => {
    if (!memberData) return null;

    const totalBalance = memberData.accounts.reduce(
      (acc, account) => acc + Number(account.currentBalance),
      0
    );

    const incomeTransactions = memberData.transactions.filter(t => t.type === 'INCOME');
    const paidIncome = incomeTransactions.filter(t => t.isPaid);
    const totalIncome = paidIncome.reduce((acc, t) => acc + Number(t.amount), 0);

    const expenseTransactions = memberData.transactions.filter(t => t.type === 'EXPENSE');
    const paidExpenses = expenseTransactions.filter(t => t.isPaid);
    const totalExpenses = paidExpenses.reduce((acc, t) => acc + Number(t.amount), 0);

    const completedGoals = memberData.goals.filter(g => g.isCompleted).length;

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      completedGoals,
      totalGoals: memberData.goals.length,
    };
  }, [memberData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!memberData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Não foi possível carregar os dados do membro.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics?.totalBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {memberData.accounts.length} contas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {metrics?.totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Mês atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {metrics?.totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Mês atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.completedGoals}/{metrics?.totalGoals}
            </div>
            <p className="text-xs text-muted-foreground">Concluídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Contas Bancárias */}
      <Card>
        <CardHeader>
          <CardTitle>Contas Bancárias</CardTitle>
          <CardDescription>Contas compartilhadas por este membro</CardDescription>
        </CardHeader>
        <CardContent>
          {memberData.accounts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma conta compartilhada
            </p>
          ) : (
            <div className="space-y-3">
              {memberData.accounts.map((account) => (
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
                  <div className="text-right">
                    <div className="font-semibold">
                      R$ {Number(account.currentBalance).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {account._count?.transactions || 0} transações
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cartões */}
      <Card>
        <CardHeader>
          <CardTitle>Cartões</CardTitle>
          <CardDescription>Cartões compartilhados por este membro</CardDescription>
        </CardHeader>
        <CardContent>
          {memberData.cards.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum cartão compartilhado
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {memberData.cards.map((card) => (
                <div key={card.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{card.name}</div>
                      <div className="text-sm text-muted-foreground">
                        •••• {card.lastDigits}
                      </div>
                      <Badge
                        variant={card.type === "CREDIT" ? "default" : "secondary"}
                        className="mt-2"
                      >
                        {card.type === "CREDIT" ? "Crédito" : "Débito"}
                      </Badge>
                    </div>
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimas 10 transações compartilhadas</CardDescription>
        </CardHeader>
        <CardContent>
          {memberData.transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma transação compartilhada
            </p>
          ) : (
            <div className="space-y-3">
              {memberData.transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("pt-BR")} •{" "}
                      {transaction.category?.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`font-semibold ${
                        transaction.type === "INCOME"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}R${" "}
                      {Number(transaction.amount).toFixed(2)}
                    </div>
                    <Badge variant={transaction.isPaid ? "default" : "outline"}>
                      {transaction.isPaid ? "Pago" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metas */}
      <Card>
        <CardHeader>
          <CardTitle>Metas</CardTitle>
          <CardDescription>Metas compartilhadas por este membro</CardDescription>
        </CardHeader>
        <CardContent>
          {memberData.goals.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma meta compartilhada
            </p>
          ) : (
            <div className="space-y-3">
              {memberData.goals.map((goal) => {
                const progress = Math.round(
                  (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
                );
                return (
                  <div key={goal.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: goal.color || "#gray" }}
                        />
                        <span className="font-medium">{goal.name}</span>
                      </div>
                      <Badge variant={goal.isCompleted ? "default" : "outline"}>
                        {progress}%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>
                          R$ {Number(goal.currentAmount).toFixed(2)}
                        </span>
                        <span>
                          R$ {Number(goal.targetAmount).toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

