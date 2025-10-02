"use client"

import { useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { useGoalsStore } from "@/store/use-goals-store"

export function GoalsProgress() {
  const { goals, fetchGoals } = useGoalsStore()

  useEffect(() => {
    fetchGoals()
  }, [])

  const activeGoals = goals.filter(g => !g.isCompleted).slice(0, 5) // Mostrar até 5 metas

  if (activeGoals.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Nenhuma meta cadastrada
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activeGoals.map((goal) => {
        const percentage = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
        return (
          <div key={goal.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                {goal.icon && <span>{goal.icon}</span>}
                {goal.name}
              </span>
              <span className="text-muted-foreground">
                R${Number(goal.currentAmount).toFixed(2)} / R${Number(goal.targetAmount).toFixed(2)}
              </span>
            </div>
            <Progress 
              value={percentage} 
              className="h-2" 
              style={{ 
                backgroundColor: goal.color ? `${goal.color}20` : undefined 
              }}
            />
            <div className="text-xs text-muted-foreground text-right">
              {percentage.toFixed(1)}% concluído
            </div>
          </div>
        )
      })}
    </div>
  )
}
