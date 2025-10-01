"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GoalForm } from "@/components/forms/goal-form"
import { GoalsList } from "@/components/goals-list"
import { Plus } from "lucide-react"

export default function GoalsPage() {
  const [showForm, setShowForm] = useState(false)

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

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Meta</CardTitle>
            <CardDescription>Defina uma nova meta financeira</CardDescription>
          </CardHeader>
          <CardContent>
            <GoalForm onCancel={() => setShowForm(false)} onSubmit={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <GoalsList />
    </div>
  )
}
