"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/charts/overview"
import { ExpensesByCategory } from "@/components/charts/expenses-by-category"
import { GoalsProgress } from "@/components/charts/goals-progress"
import { ExpenseExpectations } from "@/components/charts/expense-expectations"
import { RecentTransactions } from "@/components/recent-transactions"
import { DollarSign, TrendingUp, TrendingDown, Target, Loader2 } from "lucide-react"
import { useBankAccountsStore } from "@/store/use-bank-accounts-store"
import { useTransactionsStore } from "@/store/use-transactions-store"
import { useGoalsStore } from "@/store/use-goals-store"

export default function DashboardPage() {
  const { accounts, loading: accountsLoading, fetchAccounts } = useBankAccountsStore()
  const { transactions, loading: transactionsLoading, fetchTransactions, setFilters } = useTransactionsStore()
  const { goals, loading: goalsLoading, fetchGoals } = useGoalsStore()

  useEffect(() => {
    fetchAccounts()
    fetchGoals()
    
    // Buscar transações do mês atual
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setFilters({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
    })
    fetchTransactions()
  }, [])

  // Calcular métricas
  const totalBalance = accounts.reduce((acc, account) => acc + Number(account.currentBalance), 0)
  
  const incomeTransactions = transactions.filter(t => t.type === 'INCOME' && t.isPaid)
  const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE' && t.isPaid)
  
  const totalIncome = incomeTransactions.reduce((acc, t) => acc + Number(t.amount), 0)
  const totalExpenses = expenseTransactions.reduce((acc, t) => acc + Number(t.amount), 0)
  
  const completedGoals = goals.filter(g => g.isCompleted).length
  const totalGoals = goals.length
  const goalsPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  const loading = accountsLoading || transactionsLoading || goalsLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das suas finanças</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalBalance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalIncome.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {incomeTransactions.length} {incomeTransactions.length === 1 ? 'transação' : 'transações'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  R$ {totalExpenses.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {expenseTransactions.length} {expenseTransactions.length === 1 ? 'transação' : 'transações'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Atingidas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{completedGoals}/{totalGoals}</div>
                <p className="text-xs text-muted-foreground">
                  {goalsPercentage}% das metas concluídas
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>Comparativo dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <Overview />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>Distribuição das despesas do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensesByCategory />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progresso das Metas</CardTitle>
            <CardDescription>Acompanhe o progresso das suas metas financeiras</CardDescription>
          </CardHeader>
          <CardContent>
            <GoalsProgress />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expectativas de Despesas</CardTitle>
            <CardDescription>Projeção de gastos para os próximos meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseExpectations />
          </CardContent>
        </Card>
      </div>

      {/* Transações recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimas movimentações da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTransactions />
        </CardContent>
      </Card>
    </div>
  )
}
