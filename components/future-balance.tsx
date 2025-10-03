"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Calculator, Loader2 } from "lucide-react"

interface FutureBalanceProps {
  currentBalance: number
  paidIncome: number
  pendingIncome: number
  paidExpenses: number
  pendingExpenses: number
  loading?: boolean
}

export function FutureBalance({
  currentBalance,
  paidIncome,
  pendingIncome,
  paidExpenses,
  pendingExpenses,
  loading = false
}: FutureBalanceProps) {
  // Calcular saldo futuro
  const totalIncome = paidIncome + pendingIncome
  const totalExpenses = paidExpenses + pendingExpenses
  const futureBalance = currentBalance + totalIncome - totalExpenses
  
  // Calcular diferença em relação ao saldo atual
  const balanceDifference = futureBalance - currentBalance
  const isPositive = balanceDifference >= 0
  
  // Calcular percentual de crescimento/redução
  const percentageChange = currentBalance > 0 ? (balanceDifference / currentBalance) * 100 : 0

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Futuro</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Saldo Futuro</CardTitle>
        <Calculator className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Saldo Futuro Principal */}
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${futureBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {futureBalance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Projeção com todas as transações
              </p>
            </div>
            {isPositive ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
          </div>

          {/* Diferença */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Variação:</span>
            <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}R$ {balanceDifference.toFixed(2)}
              {Math.abs(percentageChange) > 0.01 && (
                <span className="ml-1">
                  ({isPositive ? '+' : ''}{percentageChange.toFixed(1)}%)
                </span>
              )}
            </span>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo atual:</span>
              <span>R$ {currentBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">+ Receitas totais:</span>
              <span className="text-green-600">R$ {totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">- Despesas totais:</span>
              <span className="text-red-600">R$ {totalExpenses.toFixed(2)}</span>
            </div>
            <hr className="border-t border-muted" />
            <div className="flex justify-between font-medium">
              <span>Saldo futuro:</span>
              <span className={futureBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                R$ {futureBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
