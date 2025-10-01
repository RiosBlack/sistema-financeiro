"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, Calendar, Edit, Trash2 } from "lucide-react"

const goals = [
  {
    id: 1,
    name: "Reserva de Emergência",
    type: "emergency",
    targetAmount: 10000,
    currentAmount: 8000,
    targetDate: "2024-12-31",
    description: "6 meses de gastos essenciais",
  },
  {
    id: 2,
    name: "Viagem para Europa",
    type: "travel",
    targetAmount: 15000,
    currentAmount: 3500,
    targetDate: "2024-07-15",
    description: "Viagem de férias de 20 dias",
  },
  {
    id: 3,
    name: "Carro Novo",
    type: "purchase",
    targetAmount: 45000,
    currentAmount: 15000,
    targetDate: "2025-03-01",
    description: "Troca do carro atual",
  },
  {
    id: 4,
    name: "Casa Própria",
    type: "purchase",
    targetAmount: 200000,
    currentAmount: 25000,
    targetDate: "2026-12-31",
    description: "Entrada para financiamento",
  },
]

const getGoalTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    savings: "Poupança",
    purchase: "Compra",
    investment: "Investimento",
    emergency: "Emergência",
    travel: "Viagem",
    other: "Outro",
  }
  return types[type] || type
}

const getGoalTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    savings: "bg-blue-100 text-blue-800",
    purchase: "bg-green-100 text-green-800",
    investment: "bg-purple-100 text-purple-800",
    emergency: "bg-red-100 text-red-800",
    travel: "bg-yellow-100 text-yellow-800",
    other: "bg-gray-100 text-gray-800",
  }
  return colors[type] || colors.other
}

export function GoalsList() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {goals.map((goal) => {
        const percentage = (goal.currentAmount / goal.targetAmount) * 100
        const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

        return (
          <Card key={goal.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {goal.name}
                  </CardTitle>
                  <CardDescription>{goal.description}</CardDescription>
                </div>
                <Badge className={getGoalTypeColor(goal.type)}>{getGoalTypeLabel(goal.type)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">
                    R$ {goal.currentAmount.toLocaleString()} / R$ {goal.targetAmount.toLocaleString()}
                  </span>
                </div>
                <Progress value={percentage} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{percentage.toFixed(1)}% concluído</span>
                  <span>Faltam R$ {(goal.targetAmount - goal.currentAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {daysLeft > 0
                    ? `${daysLeft} dias restantes`
                    : daysLeft === 0
                      ? "Vence hoje!"
                      : `${Math.abs(daysLeft)} dias em atraso`}
                </span>
                <span>•</span>
                <span>{new Date(goal.targetDate).toLocaleDateString("pt-BR")}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Adicionar Valor
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
