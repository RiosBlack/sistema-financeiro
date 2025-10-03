"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", 
  "#82ca9d", "#ffc658", "#ff7c7c", "#a4de6c", "#d084d0"
]

export function ExpensesByCategory() {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        
        const params = new URLSearchParams({
          type: 'EXPENSE',
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0],
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
    // Agrupar despesas por categoria
    const categoryMap = new Map<string, { name: string, value: number, color: string }>()

    transactions
      .filter(t => t.type === 'EXPENSE' && t.isPaid)
      .forEach((transaction) => {
        const categoryName = transaction.category?.name || 'Sem Categoria'
        const categoryColor = transaction.category?.color || COLORS[0]
        
        if (categoryMap.has(categoryName)) {
          const existing = categoryMap.get(categoryName)!
          existing.value += Number(transaction.amount)
        } else {
          categoryMap.set(categoryName, {
            name: categoryName,
            value: Number(transaction.amount),
            color: categoryColor,
          })
        }
      })

    // Converter para array e ordenar por valor
    const data = Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        color: item.color || COLORS[index % COLORS.length]
      }))

    setChartData(data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        Nenhuma despesa no mês atual
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`R$${value.toFixed(2)}`, "Valor"]}
          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
