"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionForm } from "@/components/forms/transaction-form"
import { Plus, Loader2, Trash2, Eye, Check, X, Search } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Transaction } from "@/types/api"

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; transaction: Transaction | null; deleteAll: boolean }>({
    open: false,
    transaction: null,
    deleteAll: false,
  })
  const [viewDialog, setViewDialog] = useState<{ open: boolean; transaction: Transaction | null }>({
    open: false,
    transaction: null,
  })
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; transaction: Transaction | null }>({
    open: false,
    transaction: null,
  })
  
  const { transactions, loading, fetchTransactions, setFilters, deleteTransaction, togglePaidStatus } = useTransactionsStore()
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

  const confirmDelete = async (deleteAll: boolean = false) => {
    if (!deleteDialog.transaction) return

    try {
      await deleteTransaction(deleteDialog.transaction.id, deleteAll)
      
      toast({
        title: deleteAll ? "Todas as parcelas deletadas!" : "Transação deletada!",
        description: deleteAll 
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

  const handleTogglePaid = (transaction: Transaction) => {
    setStatusDialog({ open: true, transaction })
  }

  const confirmTogglePaid = async () => {
    if (!statusDialog.transaction) return

    try {
      const newStatus = !statusDialog.transaction.isPaid
      await togglePaidStatus(statusDialog.transaction.id, newStatus)
      
      const statusText = newStatus ? 
        (statusDialog.transaction.type === 'INCOME' ? 'recebida' : 'paga') : 
        (statusDialog.transaction.type === 'INCOME' ? 'não recebida' : 'não paga')
      
      toast({
        title: "Status atualizado!",
        description: `A transação foi marcada como ${statusText}.`,
      })

      setStatusDialog({ open: false, transaction: null })
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o status. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.category?.name.toLowerCase().includes(searchLower) ||
        transaction.bankAccount?.name.toLowerCase().includes(searchLower) ||
        transaction.card?.name.toLowerCase().includes(searchLower)
      
      if (!matchesSearch) return false
    }
    
    return true
  })

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

      {/* Campo de busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Buscar transações..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewDialog({ open: true, transaction })}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePaid(transaction)}
                              title={transaction.isPaid ? 
                                (transaction.type === 'INCOME' ? 'Marcar como não recebida' : 'Marcar como não paga') : 
                                (transaction.type === 'INCOME' ? 'Marcar como recebida' : 'Marcar como paga')
                              }
                            >
                              {transaction.isPaid ? (
                                <X className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(transaction)}
                              title="Deletar transação"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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

      {/* Dialog de confirmação de status */}
      <AlertDialog open={statusDialog.open} onOpenChange={(open) => !open && setStatusDialog({ open: false, transaction: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração de status</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground">
                {statusDialog.transaction && (
                  <>
                    Deseja marcar a transação <strong>{statusDialog.transaction.description}</strong> como{' '}
                    <strong>
                      {!statusDialog.transaction.isPaid ? 
                        (statusDialog.transaction.type === 'INCOME' ? 'recebida' : 'paga') : 
                        (statusDialog.transaction.type === 'INCOME' ? 'não recebida' : 'não paga')
                      }
                    </strong>?
                    {statusDialog.transaction.bankAccountId && !statusDialog.transaction.isPaid && (
                      <div className="mt-2 text-xs">
                        O saldo da conta será {statusDialog.transaction.type === 'INCOME' ? 'aumentado' : 'reduzido'} em{' '}
                        <strong>R$ {Number(statusDialog.transaction.amount).toFixed(2)}</strong>.
                      </div>
                    )}
                    {statusDialog.transaction.bankAccountId && statusDialog.transaction.isPaid && (
                      <div className="mt-2 text-xs">
                        O saldo da conta será {statusDialog.transaction.type === 'INCOME' ? 'reduzido' : 'aumentado'} em{' '}
                        <strong>R$ {Number(statusDialog.transaction.amount).toFixed(2)}</strong>.
                      </div>
                    )}
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTogglePaid}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  onClick={() => confirmDelete(false)}
                >
                  Apenas esta parcela
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => confirmDelete(true)}
                >
                  Todas as {deleteDialog.transaction.installments} parcelas
                </Button>
              </>
            ) : (
              <AlertDialogAction onClick={() => confirmDelete(false)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Deletar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de visualização de detalhes */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => !open && setViewDialog({ open: false, transaction: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
            <DialogDescription>
              Informações completas da transação
            </DialogDescription>
          </DialogHeader>
          
          {viewDialog.transaction && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <p className="text-base font-medium">{viewDialog.transaction.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valor</label>
                  <p className={`text-base font-bold ${viewDialog.transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {viewDialog.transaction.type === 'INCOME' ? '+' : '-'} R$ {Number(viewDialog.transaction.amount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data</label>
                  <p className="text-base">
                    {format(new Date(viewDialog.transaction.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <p className="text-base">
                    <Badge variant={viewDialog.transaction.type === 'INCOME' ? 'default' : 'destructive'}>
                      {viewDialog.transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-base">
                    <Badge variant={viewDialog.transaction.isPaid ? 'default' : 'secondary'}>
                      {viewDialog.transaction.isPaid ? 'Pago' : 'Pendente'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                  <p className="text-base">
                    {viewDialog.transaction.category && (
                      <Badge variant="outline">
                        {viewDialog.transaction.category.icon && `${viewDialog.transaction.category.icon} `}
                        {viewDialog.transaction.category.name}
                      </Badge>
                    )}
                  </p>
                </div>
              </div>

              {/* Parcelamento */}
              {viewDialog.transaction.installments && viewDialog.transaction.installments > 1 && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground">Parcelamento</label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Parcela Atual</p>
                      <p className="text-base font-medium">
                        {viewDialog.transaction.currentInstallment} de {viewDialog.transaction.installments}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor da Parcela</p>
                      <p className="text-base font-medium">
                        R$ {Number(viewDialog.transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recorrência */}
              {viewDialog.transaction.isRecurring && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground">Recorrência</label>
                  <div className="mt-2">
                    <p className="text-base">
                      <Badge variant="outline">
                        {viewDialog.transaction.recurringType === 'DAILY' && 'Diária'}
                        {viewDialog.transaction.recurringType === 'WEEKLY' && 'Semanal'}
                        {viewDialog.transaction.recurringType === 'MONTHLY' && 'Mensal'}
                        {viewDialog.transaction.recurringType === 'YEARLY' && 'Anual'}
                      </Badge>
                    </p>
                  </div>
                </div>
              )}

              {/* Conta/Cartão */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-muted-foreground">Forma de Pagamento</label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {viewDialog.transaction.bankAccount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Conta Bancária</p>
                      <p className="text-base font-medium">
                        {viewDialog.transaction.bankAccount.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {viewDialog.transaction.bankAccount.institution}
                      </p>
                    </div>
                  )}
                  {viewDialog.transaction.card && (
                    <div>
                      <p className="text-sm text-muted-foreground">Cartão</p>
                      <p className="text-base font-medium">
                        {viewDialog.transaction.card.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        **** **** **** {viewDialog.transaction.card.lastDigits}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notas */}
              {viewDialog.transaction.notes && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground">Observações</label>
                  <p className="text-base mt-2 text-muted-foreground">
                    {viewDialog.transaction.notes}
                  </p>
                </div>
              )}

              {/* Metadados */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-muted-foreground">Informações do Sistema</label>
                <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <p>Criado em: {format(new Date(viewDialog.transaction.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  </div>
                  <div>
                    <p>Atualizado em: {format(new Date(viewDialog.transaction.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
