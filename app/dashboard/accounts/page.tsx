"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AccountForm } from "@/components/forms/account-form"
import { CardForm } from "@/components/forms/card-form"
import { Plus, Loader2 } from "lucide-react"
import { useBankAccountsStore } from "@/store/use-bank-accounts-store"
import { useCardsStore } from "@/store/use-cards-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AccountsPage() {
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  
  const { accounts, loading: accountsLoading, fetchAccounts } = useBankAccountsStore()
  const { cards, loading: cardsLoading, fetchCards } = useCardsStore()

  useEffect(() => {
    fetchAccounts()
    fetchCards()
  }, [])

  const totalBalance = accounts.reduce((acc, account) => acc + Number(account.currentBalance), 0)
  const totalCreditLimit = cards
    .filter(card => card.type === 'CREDIT' && card.limit)
    .reduce((acc, card) => acc + Number(card.limit || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas e Cartões</h1>
          <p className="text-muted-foreground">Gerencie suas contas bancárias e cartões</p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo Total</CardDescription>
            <CardTitle className="text-3xl">
              {accountsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                `R$ ${totalBalance.toFixed(2)}`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Limite de Crédito Total</CardDescription>
            <CardTitle className="text-3xl">
              {cardsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                `R$ ${totalCreditLimit.toFixed(2)}`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {cards.length} {cards.length === 1 ? 'cartão' : 'cartões'}
            </p>
          </CardContent>
        </Card>
      </div>

      {showAccountForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Conta Bancária</CardTitle>
            <CardDescription>Adicione uma nova conta bancária</CardDescription>
          </CardHeader>
          <CardContent>
            <AccountForm 
              onCancel={() => setShowAccountForm(false)} 
              onSuccess={() => {
                setShowAccountForm(false)
                fetchAccounts()
              }} 
            />
          </CardContent>
        </Card>
      )}

      {showCardForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Cartão</CardTitle>
            <CardDescription>Adicione um novo cartão de crédito ou débito</CardDescription>
          </CardHeader>
          <CardContent>
            <CardForm 
              onCancel={() => setShowCardForm(false)} 
              onSuccess={() => {
                setShowCardForm(false)
                fetchCards()
              }} 
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="accounts" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="accounts">Contas Bancárias</TabsTrigger>
            <TabsTrigger value="cards">Cartões</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button onClick={() => setShowAccountForm(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
            <Button onClick={() => setShowCardForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cartão
            </Button>
          </div>
        </div>

        <TabsContent value="accounts" className="space-y-4">
          {accountsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          ) : accounts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">Nenhuma conta cadastrada</p>
                <Button onClick={() => setShowAccountForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeira conta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      {account.color && (
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: account.color }}
                        />
                      )}
                    </div>
                    <CardDescription>{account.institution}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-2xl font-bold">
                          R$ {Number(account.currentBalance).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Saldo atual
                        </p>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{account.type}</span>
                        {account._count && (
                          <span>{account._count.transactions} transações</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          {cardsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          ) : cards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">Nenhum cartão cadastrado</p>
                <Button onClick={() => setShowCardForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeiro cartão
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <Card key={card.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{card.name}</CardTitle>
                      {card.color && (
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: card.color }}
                        />
                      )}
                    </div>
                    <CardDescription>**** {card.lastDigits}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {card.limit && (
                        <div>
                          <p className="text-2xl font-bold">
                            R$ {Number(card.limit).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Limite
                          </p>
                        </div>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{card.type === 'CREDIT' ? 'Crédito' : 'Débito'}</span>
                        {card.brand && <span>{card.brand}</span>}
                      </div>
                      {card.dueDay && (
                        <p className="text-xs text-muted-foreground">
                          Vencimento: dia {card.dueDay}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
