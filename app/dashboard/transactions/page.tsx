"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionForm } from "@/components/forms/transaction-form"
import { TransactionsList } from "@/components/transactions-list"
import { Plus } from "lucide-react"

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<"income" | "expense">("expense")

  const handleAddTransaction = (type: "income" | "expense") => {
    setFormType(type)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleAddTransaction("income")} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Receita
          </Button>
          <Button onClick={() => handleAddTransaction("expense")} variant="destructive">
            <Plus className="h-4 w-4 mr-2" />
            Despesa
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{formType === "income" ? "Nova Receita" : "Nova Despesa"}</CardTitle>
            <CardDescription>
              Adicione uma nova {formType === "income" ? "receita" : "despesa"} ao seu orçamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm type={formType} onCancel={() => setShowForm(false)} onSubmit={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="expense">Despesas</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <TransactionsList filter="all" />
        </TabsContent>
        <TabsContent value="income">
          <TransactionsList filter="income" />
        </TabsContent>
        <TabsContent value="expense">
          <TransactionsList filter="expense" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
