"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

export function ExpenseExpectations() {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date()
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 4, 0)
        
        const params = new URLSearchParams({
          type: 'EXPENSE',
          startDate: threeMonthsAgo.toISOString().split('T')[0],
          endDate: threeMonthsAhead.toISOString().split('T')[0],
        })

        const response = await fetch(`/api/transactions?${params.toString()}`)
        if (!response.ok) throw new Error('Erro ao buscar transações')
        
        const data = await response.json()
        processChartData(data.transactions)
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const processChartData = (transactions: any[]) => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const data = []

    // Gerar dados para 6 meses (3 passados + atual + 2 futuros)
    for (let i = -2; i <= 3; i++) {
      const date = new Date(currentYear, currentMonth + i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()
      const isFuture = i > 0

      // Calcular despesas realizadas (pagas)
      const monthExpenses = transactions
        .filter(t => {
          const tDate = new Date(t.date)
          return (
            t.type === 'EXPENSE' &&
            t.isPaid &&
            tDate.getMonth() === month &&
            tDate.getFullYear() === year
          )
        })
        .reduce((sum, t) => sum + Number(t.amount), 0)

      // Calcular todas as despesas do mês (pagas + não pagas) para expectativa
      const allMonthExpenses = transactions
        .filter(t => {
          const tDate = new Date(t.date)
          return (
            t.type === 'EXPENSE' &&
            tDate.getMonth() === month &&
            tDate.getFullYear() === year
          )
        })
        .reduce((sum, t) => sum + Number(t.amount), 0)

      data.push({
        name: monthNames[month],
        expectativa: allMonthExpenses,
        realizado: !isFuture ? monthExpenses : null,
      })
    }

    setChartData(data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
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
          formatter={(value: number | null) => value ? [`R$${value.toFixed(2)}`, ""] : ['N/A', '']}
          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="expectativa"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ fill: "#8884d8" }}
          name="Expectativa"
        />
        <Line
          type="monotone"
          dataKey="realizado"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={{ fill: "#82ca9d" }}
          name="Realizado"
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
