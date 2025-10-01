"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Alimentação", value: 1200, color: "#0088FE" },
  { name: "Transporte", value: 800, color: "#00C49F" },
  { name: "Moradia", value: 2000, color: "#FFBB28" },
  { name: "Lazer", value: 400, color: "#FF8042" },
  { name: "Saúde", value: 600, color: "#8884d8" },
  { name: "Outros", value: 300, color: "#82ca9d" },
]

export function ExpensesByCategory() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`R$${value}`, "Valor"]} />
      </PieChart>
    </ResponsiveContainer>
  )
}
