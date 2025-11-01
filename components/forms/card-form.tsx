"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { brandIcons } from "@/components/ui/card-brands"
import { useCardsStore } from "@/store/use-cards-store"
import { useBankAccountsStore } from "@/store/use-bank-accounts-store"
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
})

type CardFormData = z.infer<typeof cardSchema>

const brandLabels: Record<string, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  ELO: "Elo",
  AMEX: "American Express",
  HIPERCARD: "Hipercard",
  OTHER: "Outra",
};

const renderBrandOption = (brand: keyof typeof brandIcons, label: string) => {
  const BrandIcon = brandIcons[brand];
  return (
    <div className="flex items-center gap-2">
      <BrandIcon className={brand === "OTHER" ? "h-4 w-4" : "h-4 w-12"} />
      <span>{label}</span>
    </div>
  );
};

interface CardFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CardForm({ onSuccess, onCancel }: CardFormProps) {
  const { toast } = useToast()
  const { createCard } = useCardsStore()
  const { accounts, fetchAccounts } = useBankAccountsStore()

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: "",
      lastDigits: "",
      type: "CREDIT",
      brand: "",
      limit: undefined,
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
            render={({ field }) => {
              const BrandIcon = field.value ? brandIcons[field.value as keyof typeof brandIcons] || brandIcons.OTHER : null;
              return (
                <FormItem>
                  <FormLabel>Bandeira</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a bandeira">
                          {BrandIcon && field.value && (
                            renderBrandOption(field.value as keyof typeof brandIcons, brandLabels[field.value] || "")
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VISA">
                        {renderBrandOption("VISA", brandLabels.VISA)}
                      </SelectItem>
                      <SelectItem value="MASTERCARD">
                        {renderBrandOption("MASTERCARD", brandLabels.MASTERCARD)}
                      </SelectItem>
                      <SelectItem value="ELO">
                        {renderBrandOption("ELO", brandLabels.ELO)}
                      </SelectItem>
                      <SelectItem value="AMEX">
                        {renderBrandOption("AMEX", brandLabels.AMEX)}
                      </SelectItem>
                      <SelectItem value="HIPERCARD">
                        {renderBrandOption("HIPERCARD", brandLabels.HIPERCARD)}
                      </SelectItem>
                      <SelectItem value="OTHER">
                        {renderBrandOption("OTHER", brandLabels.OTHER)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
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
                      <CurrencyInput
                        placeholder="R$ 0,00"
                        value={field.value || undefined}
                        onValueChange={(values) => {
                          const { floatValue } = values;
                          field.onChange(floatValue || undefined);
                        }}
                        onBlur={field.onBlur}
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

