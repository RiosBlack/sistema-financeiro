"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionForm } from "@/components/forms/transaction-form"
import { Plus, Loader2, Trash2 } from "lucide-react"
import { useTransactionsStore } from "@/store/use-transactions-store"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Transaction } from "@/types/api"

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [activeTab, setActiveTab] = useState("all")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; transaction: Transaction | null; deleteAll: boolean }>({
    open: false,
    transaction: null,
    deleteAll: false,
  })
  
  const { transactions, loading, fetchTransactions, setFilters, deleteTransaction } = useTransactionsStore()
  const { toast } = useToast()

  useEffect(() => {
    // Carregar todas as transações inicialmente
    setFilters({})
    fetchTransactions()
  }, [])

  const handleAddTransaction = (type: "INCOME" | "EXPENSE") => {
    setFormType(type)
    setShowForm(true)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "all") {
      setFilters({})
    } else if (value === "income") {
      setFilters({ type: "INCOME" })
    } else {
      setFilters({ type: "EXPENSE" })
    }
    fetchTransactions()
  }

  const handleDelete = (transaction: Transaction) => {
    // Se é uma parcela (installments > 1), perguntar se quer deletar todas
    if (transaction.installments && transaction.installments > 1) {
      setDeleteDialog({ open: true, transaction, deleteAll: false })
    } else {
      // Transação única, deletar direto
      setDeleteDialog({ open: true, transaction, deleteAll: false })
    }
  }

  const confirmDelete = async () => {
    if (!deleteDialog.transaction) return

    try {
      await deleteTransaction(deleteDialog.transaction.id, deleteDialog.deleteAll)
      
      toast({
        title: deleteDialog.deleteAll ? "Todas as parcelas deletadas!" : "Transação deletada!",
        description: deleteDialog.deleteAll 
          ? "Todas as parcelas foram removidas com sucesso." 
          : "A transação foi removida com sucesso.",
      })
      
      setDeleteDialog({ open: false, transaction: null, deleteAll: false })
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        description: "Ocorreu um erro ao deletar a transação. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const filteredTransactions = transactions

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleAddTransaction("INCOME")} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Receita
          </Button>
          <Button onClick={() => handleAddTransaction("EXPENSE")} variant="destructive">
            <Plus className="h-4 w-4 mr-2" />
            Despesa
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{formType === "INCOME" ? "Nova Receita" : "Nova Despesa"}</CardTitle>
            <CardDescription>
              Adicione uma nova {formType === "INCOME" ? "receita" : "despesa"} ao seu orçamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm 
              type={formType} 
              onCancel={() => setShowForm(false)} 
              onSuccess={() => {
                setShowForm(false)
                fetchTransactions()
              }} 
            />
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({transactions.length})</TabsTrigger>
          <TabsTrigger value="income">
            Receitas ({transactions.filter(t => t.type === 'INCOME').length})
          </TabsTrigger>
          <TabsTrigger value="expense">
            Despesas ({transactions.filter(t => t.type === 'EXPENSE').length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Lista de Transações</CardTitle>
              <CardDescription>
                Todas as suas movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">Nenhuma transação encontrada</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar primeira transação
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Conta/Cartão</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            {transaction.installments && transaction.installments > 1 && (
                              <p className="text-xs text-muted-foreground">
                                Parcela {transaction.currentInstallment}/{transaction.installments}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.category && (
                            <Badge variant="outline">
                              {transaction.category.icon && `${transaction.category.icon} `}
                              {transaction.category.name}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.bankAccount && (
                            <span className="text-sm">{transaction.bankAccount.name}</span>
                          )}
                          {transaction.card && (
                            <span className="text-sm">
                              {transaction.card.name} **** {transaction.card.lastDigits}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.isPaid ? "default" : "secondary"}>
                            {transaction.isPaid ? "Pago" : "Pendente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'INCOME' ? '+' : '-'} R$ {Number(transaction.amount).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, transaction: null, deleteAll: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.transaction?.installments && deleteDialog.transaction.installments > 1
                ? "Deletar parcela ou todas?"
                : "Confirmar exclusão"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              {deleteDialog.transaction?.installments && deleteDialog.transaction.installments > 1 ? (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    Esta é a parcela <strong>{deleteDialog.transaction.currentInstallment}/{deleteDialog.transaction.installments}</strong> de <strong>{deleteDialog.transaction.description}</strong>.
                  </div>
                  <div>Você deseja deletar apenas esta parcela ou todas as {deleteDialog.transaction.installments} parcelas?</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Tem certeza que deseja deletar a transação <strong>{deleteDialog.transaction?.description}</strong>? 
                  Esta ação não pode ser desfeita.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {deleteDialog.transaction?.installments && deleteDialog.transaction.installments > 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialog(prev => ({ ...prev, deleteAll: false }))
                    confirmDelete()
                  }}
                >
                  Apenas esta parcela
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeleteDialog(prev => ({ ...prev, deleteAll: true }))
                    confirmDelete()
                  }}
                >
                  Todas as {deleteDialog.transaction.installments} parcelas
                </Button>
              </>
            ) : (
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Deletar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
