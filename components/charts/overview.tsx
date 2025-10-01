"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

const data = [
  {
    name: "Jan",
    receitas: 4000,
    despesas: 2400,
  },
  {
    name: "Fev",
    receitas: 3000,
    despesas: 1398,
  },
  {
    name: "Mar",
    receitas: 2000,
    despesas: 9800,
  },
  {
    name: "Abr",
    receitas: 2780,
    despesas: 3908,
  },
  {
    name: "Mai",
    receitas: 1890,
    despesas: 4800,
  },
  {
    name: "Jun",
    receitas: 2390,
    despesas: 3800,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value}`}
        />
        <Tooltip formatter={(value) => [`R$${value}`, ""]} labelFormatter={(label) => `Mês: ${label}`} />
        <Legend />
        <Bar dataKey="receitas" fill="#22c55e" radius={[4, 4, 0, 0]} name="Receitas" />
        <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesas" />
      </BarChart>
    </ResponsiveContainer>
  )
}
