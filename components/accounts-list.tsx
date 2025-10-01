"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Wallet, Edit, Trash2, Eye } from "lucide-react"

const accounts = [
  {
    id: 1,
    name: "Conta Principal",
    type: "checking",
    bank: "Nubank",
    balance: 5420.5,
    icon: Wallet,
    color: "bg-purple-500",
  },
  {
    id: 2,
    name: "Poupança",
    type: "savings",
    bank: "Banco do Brasil",
    balance: 12500.0,
    icon: Wallet,
    color: "bg-yellow-500",
  },
  {
    id: 3,
    name: "Cartão Nubank",
    type: "credit",
    bank: "Nubank",
    balance: -850.3,
    creditLimit: 5000,
    icon: CreditCard,
    color: "bg-purple-500",
  },
  {
    id: 4,
    name: "Cartão Itaú",
    type: "credit",
    bank: "Itaú",
    balance: -1200.0,
    creditLimit: 8000,
    icon: CreditCard,
    color: "bg-orange-500",
  },
]

const getAccountTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    checking: "Conta Corrente",
    savings: "Poupança",
    credit: "Cartão de Crédito",
    debit: "Cartão de Débito",
  }
  return types[type] || type
}

export function AccountsList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => {
        const Icon = account.icon
        const isCredit = account.type === "credit"
        const creditUsage =
          isCredit && account.creditLimit ? (Math.abs(account.balance) / account.creditLimit) * 100 : 0

        return (
          <Card key={account.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${account.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <CardDescription>
                      {getAccountTypeLabel(account.type)} • {account.bank}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{isCredit ? "Fatura Atual" : "Saldo"}</span>
                  <span
                    className={`text-lg font-bold ${
                      isCredit ? "text-red-600" : account.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    R${" "}
                    {Math.abs(account.balance).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {isCredit && account.creditLimit && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Limite disponível</span>
                      <span>
                        R${" "}
                        {(account.creditLimit - Math.abs(account.balance)).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <Progress value={creditUsage} className="h-2" />
                    <div className="text-xs text-muted-foreground text-center">
                      {creditUsage.toFixed(1)}% do limite utilizado
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
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
