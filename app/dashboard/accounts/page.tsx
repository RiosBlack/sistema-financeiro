"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AccountForm } from "@/components/forms/account-form"
import { AccountsList } from "@/components/accounts-list"
import { Plus } from "lucide-react"

export default function AccountsPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas e Cartões</h1>
          <p className="text-muted-foreground">Gerencie suas contas bancárias e cartões de crédito</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Conta</CardTitle>
            <CardDescription>Adicione uma nova conta bancária ou cartão de crédito</CardDescription>
          </CardHeader>
          <CardContent>
            <AccountForm onCancel={() => setShowForm(false)} onSubmit={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <AccountsList />
    </div>
  )
}
