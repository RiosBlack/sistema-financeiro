"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Jul", expectativa: 3200, realizado: 3000 },
  { name: "Ago", expectativa: 3400, realizado: 3200 },
  { name: "Set", expectativa: 3100, realizado: null },
  { name: "Out", expectativa: 3300, realizado: null },
  { name: "Nov", expectativa: 3500, realizado: null },
  { name: "Dez", expectativa: 4000, realizado: null },
]

export function ExpenseExpectations() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value}`}
        />
        <Tooltip formatter={(value) => [`R$${value}`, ""]} />
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
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
