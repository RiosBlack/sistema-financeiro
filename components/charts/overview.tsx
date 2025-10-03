"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

export function Overview() {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Buscar transações dos últimos 6 meses diretamente da API
        const now = new Date()
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
        
        const params = new URLSearchParams({
          startDate: sixMonthsAgo.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
        })

        const response = await fetch(`/api/transactions?${params.toString()}`)
        if (!response.ok) throw new Error('Erro ao buscar transações')
        
        const data = await response.json()
        console.log('📊 Overview - Transações recebidas:', data.transactions?.length || 0)
        console.log('📊 Overview - Dados completos:', data)
        processChartData(data.transactions || [])
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
    const last6Months = []

    console.log('📊 Processando transações:', transactions.length)

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

    console.log('📊 Meses criados:', last6Months.map(m => `${m.name}/${m.year}`))

    // Agregar transações por mês
    let processedCount = 0
    transactions.forEach((transaction) => {
      console.log('📊 Transação:', {
        description: transaction.description,
        type: transaction.type,
        amount: transaction.amount,
        isPaid: transaction.isPaid,
        date: transaction.date
      })

      // REMOVIDO FILTRO DE isPaid - mostrar todas as transações
      const date = new Date(transaction.date)
      const monthData = last6Months.find(
        m => m.month === date.getMonth() && m.year === date.getFullYear()
      )

      if (monthData) {
        processedCount++
        const amount = Number(transaction.amount)
        if (transaction.type === 'INCOME') {
          monthData.receitas += amount
        } else {
          monthData.despesas += amount
        }
      }
    })

    console.log('📊 Transações processadas:', processedCount)
    console.log('📊 Dados finais:', last6Months)

    setChartData(last6Months)
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
        Nenhuma transação nos últimos 6 meses
      </div>
    )
  }

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
