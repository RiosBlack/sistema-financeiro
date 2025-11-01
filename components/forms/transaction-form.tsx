"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { transactionSchema, type TransactionFormData } from "@/lib/validations"
import { useCategoriesStore } from "@/store/use-categories-store"
import { useBankAccountsStore } from "@/store/use-bank-accounts-store"
import { useCardsStore } from "@/store/use-cards-store"
import { useTransactionsStore } from "@/store/use-transactions-store"
import { toast } from "sonner"
import { useState } from "react"

interface TransactionFormProps {
  type: "INCOME" | "EXPENSE"
  onSuccess?: () => void
  onCancel: () => void
}

export function TransactionForm({ type, onSuccess, onCancel }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { categories, fetchCategories, getCategoriesByType } = useCategoriesStore()
  const { accounts, fetchAccounts } = useBankAccountsStore()
  const { cards, fetchCards } = useCardsStore()
  const { addTransaction } = useTransactionsStore()

  useEffect(() => {
    fetchCategories()
    fetchAccounts()
    fetchCards()
  }, [])

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: 0,
      type,
      date: new Date().toISOString().split('T')[0],
      categoryId: "",
      bankAccountId: "",
      cardId: "",
      isPaid: false,
      isRecurring: false,
      installments: 1,
      notes: "",
    },
  })

  const watchBankAccount = form.watch("bankAccountId")
  const watchCard = form.watch("cardId")
  const watchIsRecurring = form.watch("isRecurring")

  // Se selecionar cartão, limpar conta bancária e vice-versa
  useEffect(() => {
    if (watchCard) {
      form.setValue("bankAccountId", "")
    }
  }, [watchCard])

  useEffect(() => {
    if (watchBankAccount) {
      form.setValue("cardId", "")
    }
  }, [watchBankAccount])

  async function onSubmit(data: TransactionFormData) {
    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar transação')
      }

      const result = await response.json()
      
      // Se foi parcelada, mostra mensagem diferente
      if (result.installments) {
        toast.success(`Transação parcelada criada! ${result.installments.length} parcelas.`)
      } else {
        toast.success('Transação criada com sucesso!')
      }
      
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar transação')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCategories = getCategoriesByType(type)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Compra no supermercado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <CurrencyInput 
                    placeholder="R$ 0,00"
                    value={field.value || 0}
                    onValueChange={(values) => {
                      const { floatValue } = values;
                      field.onChange(floatValue || 0);
                    }}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon && `${category.icon} `}{category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bankAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta Bancária {!watchCard && "*"}</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value === "none" ? "" : value)
                    if (value !== "none") {
                      form.setValue("cardId", "")
                    }
                  }} 
                  value={field.value || "none"}
                  disabled={!!watchCard}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {account.institution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cardId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cartão {!watchBankAccount && "*"}</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value === "none" ? "" : value)
                    if (value !== "none") {
                      form.setValue("bankAccountId", "")
                    }
                  }}
                  value={field.value || "none"}
                  disabled={!!watchBankAccount}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cartão" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {cards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name} - **** {card.lastDigits}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="installments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parcelas</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="60" 
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormDescription>Deixe 1 para pagamento único</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="isPaid"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Marcar como pago</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Transação recorrente</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {watchIsRecurring && (
          <FormField
            control={form.control}
            name="recurringType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Recorrência</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DAILY">Diário</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações adicionais (opcional)" 
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={type === "INCOME" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isSubmitting ? 'Salvando...' : `Salvar ${type === "INCOME" ? "Receita" : "Despesa"}`}
          </Button>
        </div>
      </form>
    </Form>
  )
}
