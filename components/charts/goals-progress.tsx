"use client"

import { Progress } from "@/components/ui/progress"

const goals = [
  { name: "Reserva de Emergência", current: 8000, target: 10000, color: "bg-blue-500" },
  { name: "Viagem", current: 3500, target: 5000, color: "bg-green-500" },
  { name: "Carro Novo", current: 15000, target: 30000, color: "bg-yellow-500" },
  { name: "Casa Própria", current: 25000, target: 100000, color: "bg-purple-500" },
]

export function GoalsProgress() {
  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const percentage = (goal.current / goal.target) * 100
        return (
          <div key={goal.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{goal.name}</span>
              <span className="text-muted-foreground">
                R${goal.current.toLocaleString()} / R${goal.target.toLocaleString()}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}% concluído</div>
          </div>
        )
      })}
    </div>
  )
}
