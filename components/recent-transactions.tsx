"use client"

import { useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTransactionsStore } from "@/store/use-transactions-store"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2 } from "lucide-react"

export function RecentTransactions() {
  const { transactions, loading, fetchTransactions, setFilters } = useTransactionsStore()

  useEffect(() => {
    // Buscar últimas transações
    setFilters({ limit: 10 })
    fetchTransactions()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        Nenhuma transação recente
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Conta/Cartão</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.slice(0, 10).map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">
              <div>
                {transaction.description}
                {transaction.installments && transaction.installments > 1 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({transaction.currentInstallment}/{transaction.installments})
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {transaction.category && (
                <div className="flex items-center gap-1">
                  {transaction.category.icon && <span>{transaction.category.icon}</span>}
                  <span className="text-sm">{transaction.category.name}</span>
                </div>
              )}
            </TableCell>
            <TableCell>
              {transaction.bankAccount && (
                <span className="text-sm">{transaction.bankAccount.name}</span>
              )}
              {transaction.card && (
                <span className="text-sm">
                  {transaction.card.name}
                </span>
              )}
            </TableCell>
            <TableCell className="text-sm">
              {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
            </TableCell>
            <TableCell>
              <Badge variant={transaction.isPaid ? "default" : "secondary"} className="text-xs">
                {transaction.isPaid ? "Pago" : "Pendente"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Badge
                variant={transaction.type === "INCOME" ? "default" : "destructive"}
                className={
                  transaction.type === "INCOME" 
                    ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100" 
                    : ""
                }
              >
                {transaction.type === "INCOME" ? "+" : "-"}
                R$ {Number(transaction.amount).toFixed(2)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
