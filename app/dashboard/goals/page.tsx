"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GoalForm } from "@/components/forms/goal-form"
import { Plus, Loader2, Target, TrendingUp } from "lucide-react"
import { useGoalsStore } from "@/store/use-goals-store"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function GoalsPage() {
  const [showForm, setShowForm] = useState(false)
  const [contributionAmount, setContributionAmount] = useState("")
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  
  const { goals, loading, fetchGoals } = useGoalsStore()

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleContribute = async (goalId: string, amount: number) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      if (!response.ok) throw new Error('Erro ao adicionar contribuição')
      
      toast.success('Contribuição adicionada com sucesso!')
      fetchGoals()
      setSelectedGoal(null)
      setContributionAmount("")
    } catch (error) {
      toast.error('Erro ao adicionar contribuição')
    }
  }

  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.isCompleted).length
  const activeGoals = goals.filter(g => !g.isCompleted)
  const totalTargetAmount = goals.reduce((acc, g) => acc + Number(g.targetAmount), 0)
  const totalCurrentAmount = goals.reduce((acc, g) => acc + Number(g.currentAmount), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
          <p className="text-muted-foreground">Defina e acompanhe suas metas financeiras</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Metas</CardDescription>
            <CardTitle className="text-3xl">
              {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : totalGoals}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {completedGoals} concluídas, {activeGoals.length} ativas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Valor Total das Metas</CardDescription>
            <CardTitle className="text-3xl">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                `R$ ${totalTargetAmount.toFixed(2)}`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Objetivo total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Economizado</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                `R$ ${totalCurrentAmount.toFixed(2)}`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {totalTargetAmount > 0 ? ((totalCurrentAmount / totalTargetAmount) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Meta</CardTitle>
            <CardDescription>Defina uma nova meta financeira</CardDescription>
          </CardHeader>
          <CardContent>
            <GoalForm 
              onCancel={() => setShowForm(false)} 
              onSuccess={() => {
                setShowForm(false)
                fetchGoals()
              }} 
            />
          </CardContent>
        </Card>
      )}

      {/* Lista de Metas */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Metas Ativas</h2>
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        ) : activeGoals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma meta ativa</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira meta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeGoals.map((goal) => {
              const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
              const remaining = Number(goal.targetAmount) - Number(goal.currentAmount)
              
              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {goal.icon && <span className="text-2xl">{goal.icon}</span>}
                        <CardTitle>{goal.name}</CardTitle>
                      </div>
                      {goal.color && (
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: goal.color }}
                        />
                      )}
                    </div>
                    {goal.description && (
                      <CardDescription>{goal.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Atual</p>
                        <p className="font-bold text-green-600">
                          R$ {Number(goal.currentAmount).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Meta</p>
                        <p className="font-bold">
                          R$ {Number(goal.targetAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {remaining > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Faltam R$ {remaining.toFixed(2)} para atingir a meta
                      </p>
                    )}
                    
                    {goal.deadline && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        Prazo: {format(new Date(goal.deadline), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full" onClick={() => setSelectedGoal(goal.id)}>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Adicionar Contribuição
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Contribuir para {goal.name}</DialogTitle>
                          <DialogDescription>
                            Adicione um valor para esta meta
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount">Valor da Contribuição</Label>
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={contributionAmount}
                              onChange={(e) => setContributionAmount(e.target.value)}
                            />
                          </div>
                          <Button 
                            className="w-full"
                            onClick={() => {
                              const amount = parseFloat(contributionAmount)
                              if (amount > 0) {
                                handleContribute(goal.id, amount)
                              }
                            }}
                          >
                            Confirmar Contribuição
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Metas Concluídas */}
      {completedGoals > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Metas Concluídas</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {goals.filter(g => g.isCompleted).map((goal) => (
              <Card key={goal.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {goal.icon && <span className="text-2xl">{goal.icon}</span>}
                      <CardTitle>{goal.name}</CardTitle>
                    </div>
                    <Badge className="bg-green-600">Concluída</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-green-600">
                      R$ {Number(goal.currentAmount).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Meta de R$ {Number(goal.targetAmount).toFixed(2)} atingida!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
