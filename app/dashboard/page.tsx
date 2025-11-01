"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/charts/overview"
import { ExpensesByCategory } from "@/components/charts/expenses-by-category"
import { GoalsProgress } from "@/components/charts/goals-progress"
import { ExpenseExpectations } from "@/components/charts/expense-expectations"
import { RecentTransactions } from "@/components/recent-transactions"
import { FutureBalance } from "@/components/future-balance"
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
  const totalBalance = accounts.reduce((acc, account) => {
    const balance = Number(account.currentBalance)
    return acc + balance
  }, 0)

  const incomeTransactions = transactions.filter(t => t.type === 'INCOME')
  const paidIncomeTransactions = incomeTransactions.filter(t => t.isPaid)
  const pendingIncomeTransactions = incomeTransactions.filter(t => !t.isPaid)

  const totalIncome = incomeTransactions.reduce((acc, t) => acc + Number(t.amount), 0)
  const paidIncome = paidIncomeTransactions.reduce((acc, t) => acc + Number(t.amount), 0)
  const pendingIncome = pendingIncomeTransactions.reduce((acc, t) => acc + Number(t.amount), 0)

  // Despesas
  const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE')
  const paidExpenseTransactions = expenseTransactions.filter(t => t.isPaid)
  const pendingExpenseTransactions = expenseTransactions.filter(t => !t.isPaid)

  const totalExpenses = expenseTransactions.reduce((acc, t) => acc + Number(t.amount), 0)
  const paidExpenses = paidExpenseTransactions.reduce((acc, t) => acc + Number(t.amount), 0)
  const pendingExpenses = pendingExpenseTransactions.reduce((acc, t) => acc + Number(t.amount), 0)

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Saldo Total */}
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
                <div className="text-2xl font-bold text-blue-600">
                  R$ {totalBalance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Receitas Recebidas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Recebidas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  R$ {paidIncome.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {paidIncomeTransactions.length} {paidIncomeTransactions.length === 1 ? 'transação' : 'transações'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Receitas Pendentes (A Receber) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas a Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-400">
                  R$ {pendingIncome.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingIncomeTransactions.length} {pendingIncomeTransactions.length === 1 ? 'transação' : 'transações'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Despesas Pagas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Pagas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  R$ {paidExpenses.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {paidExpenseTransactions.length} {paidExpenseTransactions.length === 1 ? 'transação' : 'transações'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Despesas Pendentes (A Pagar) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas a Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-400">
                  R$ {pendingExpenses.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pendingExpenseTransactions.length} {pendingExpenseTransactions.length === 1 ? 'transação' : 'transações'}
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

        <div className="grid gap-6">
          {/* Saldo Futuro */}
          <FutureBalance
            currentBalance={totalBalance}
            paidIncome={paidIncome}
            pendingIncome={pendingIncome}
            paidExpenses={paidExpenses}
            pendingExpenses={pendingExpenses}
            loading={loading}
          />

          {/* Despesas por Categoria */}
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
