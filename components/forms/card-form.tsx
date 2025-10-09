"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCardsStore } from "@/store/use-cards-store"
import { useBankAccountsStore } from "@/store/use-bank-accounts-store"
import { useFamilyStore } from "@/store/use-family-store"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

const cardSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  lastDigits: z.string().length(4, "Últimos 4 dígitos são obrigatórios"),
  type: z.enum(["CREDIT", "DEBIT"]),
  brand: z.string().optional(),
  limit: z.number().optional(),
  dueDay: z.number().min(1).max(31).optional(),
  closingDay: z.number().min(1).max(31).optional(),
  bankAccountId: z.string().optional(),
  color: z.string().optional(),
  isShared: z.boolean().optional().default(false),
})

type CardFormData = z.infer<typeof cardSchema>

interface CardFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CardForm({ onSuccess, onCancel }: CardFormProps) {
  const { toast } = useToast()
  const { createCard } = useCardsStore()
  const { accounts, fetchAccounts } = useBankAccountsStore()
  const { family, fetchFamily } = useFamilyStore()

  useEffect(() => {
    fetchAccounts()
    fetchFamily()
  }, [fetchAccounts, fetchFamily])

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: "",
      lastDigits: "",
      type: "CREDIT",
      brand: "",
      limit: undefined,
      isShared: false,
      dueDay: undefined,
      closingDay: undefined,
      bankAccountId: "",
      color: "#6366f1",
    },
  })

  const watchType = form.watch("type")

  const onSubmit = async (data: CardFormData) => {
    try {
      // Converter campos opcionais
      const cardData = {
        ...data,
        limit: data.limit || undefined,
        dueDay: data.dueDay || undefined,
        closingDay: data.closingDay || undefined,
        bankAccountId: data.bankAccountId || undefined,
        brand: data.brand || undefined,
      }

      await createCard(cardData)

      toast({
        title: "Cartão criado!",
        description: "O cartão foi adicionado com sucesso.",
      })

      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao criar cartão:", error)
      toast({
        title: "Erro ao criar cartão",
        description: "Ocorreu um erro ao adicionar o cartão. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cartão *</FormLabel>
                <FormControl>
                  <Input placeholder="Cartão Principal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastDigits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Últimos 4 Dígitos *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="1234" 
                    maxLength={4}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      field.onChange(value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CREDIT">Crédito</SelectItem>
                    <SelectItem value="DEBIT">Débito</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bandeira</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a bandeira" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="VISA">Visa</SelectItem>
                    <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                    <SelectItem value="ELO">Elo</SelectItem>
                    <SelectItem value="AMEX">American Express</SelectItem>
                    <SelectItem value="HIPERCARD">Hipercard</SelectItem>
                    <SelectItem value="OTHER">Outra</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {watchType === "CREDIT" && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia Vencimento</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        max="31"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Dia do mês</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closingDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia Fechamento</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        max="31"
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Dia do mês</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bankAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta Vinculada</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                  value={field.value || "none"}
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
                <FormDescription className="text-xs">
                  Conta para débito/pagamento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input type="color" {...field} className="w-20 h-10" />
                    <Input 
                      type="text" 
                      value={field.value} 
                      onChange={field.onChange}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {family && (
          <FormField
            control={form.control}
            name="isShared"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Compartilhar com Família</FormLabel>
                  <FormDescription>
                    Permitir que todos os membros da família {family.name} visualizem este cartão
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Cartão'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

