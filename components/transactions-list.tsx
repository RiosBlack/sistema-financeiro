"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"

interface TransactionsListProps {
  filter: "all" | "income" | "expense"
}

const transactions = [
  {
    id: 1,
    description: "Salário",
    category: "Receita",
    subcategory: "Trabalho",
    amount: 5000,
    type: "income",
    date: "2024-01-15",
    user: "João Silva",
    account: "Conta Corrente",
  },
  {
    id: 2,
    description: "Supermercado",
    category: "Alimentação",
    subcategory: "Compras",
    amount: -250,
    type: "expense",
    date: "2024-01-14",
    user: "Maria Silva",
    account: "Cartão de Crédito",
  },
  {
    id: 3,
    description: "Combustível",
    category: "Transporte",
    subcategory: "Gasolina",
    amount: -120,
    type: "expense",
    date: "2024-01-13",
    user: "João Silva",
    account: "Cartão de Débito",
  },
  {
    id: 4,
    description: "Freelance",
    category: "Receita",
    subcategory: "Extra",
    amount: 800,
    type: "income",
    date: "2024-01-12",
    user: "João Silva",
    account: "Conta Poupança",
  },
  {
    id: 5,
    description: "Academia",
    category: "Saúde",
    subcategory: "Exercícios",
    amount: -89,
    type: "expense",
    date: "2024-01-11",
    user: "Maria Silva",
    account: "Cartão de Crédito",
  },
  {
    id: 6,
    description: "Dividendos",
    category: "Investimentos",
    subcategory: "Ações",
    amount: 150,
    type: "income",
    date: "2024-01-10",
    user: "João Silva",
    account: "Conta Investimentos",
  },
]

export function TransactionsList({ filter }: TransactionsListProps) {
  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true
    return transaction.type === filter
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {filter === "all" && "Todas as Transações"}
          {filter === "income" && "Receitas"}
          {filter === "expense" && "Despesas"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{transaction.category}</span>
                    <span className="text-xs text-muted-foreground">{transaction.subcategory}</span>
                  </div>
                </TableCell>
                <TableCell>{transaction.user}</TableCell>
                <TableCell>{transaction.account}</TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={transaction.type === "income" ? "default" : "destructive"}
                    className={transaction.type === "income" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                  >
                    {transaction.type === "income" ? "+" : ""}
                    R$ {Math.abs(transaction.amount).toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
