"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { useTransactionsStore } from "@/store/use-transactions-store"

export function Overview() {
  const { transactions, fetchTransactions, setFilters } = useTransactionsStore()
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // Buscar transações dos últimos 6 meses
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    
    setFilters({
      startDate: sixMonthsAgo.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    })
    fetchTransactions()
  }, [])

  useEffect(() => {
    // Processar dados para o gráfico
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const now = new Date()
    const last6Months = []

    // Criar array com os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      last6Months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        name: monthNames[date.getMonth()],
        receitas: 0,
        despesas: 0,
      })
    }

    // Agregar transações por mês
    transactions.forEach((transaction) => {
      if (!transaction.isPaid) return // Apenas transações pagas

      const date = new Date(transaction.date)
      const monthData = last6Months.find(
        m => m.month === date.getMonth() && m.year === date.getFullYear()
      )

      if (monthData) {
        const amount = Number(transaction.amount)
        if (transaction.type === 'INCOME') {
          monthData.receitas += amount
        } else {
          monthData.despesas += amount
        }
      }
    })

    setChartData(last6Months)
  }, [transactions])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis 
          dataKey="name" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value.toFixed(0)}`}
        />
        <Tooltip 
          formatter={(value: number) => [`R$${value.toFixed(2)}`, ""]} 
          labelFormatter={(label) => `Mês: ${label}`}
          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
        />
        <Legend />
        <Bar dataKey="receitas" fill="#22c55e" radius={[4, 4, 0, 0]} name="Receitas" />
        <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesas" />
      </BarChart>
    </ResponsiveContainer>
  )
}
