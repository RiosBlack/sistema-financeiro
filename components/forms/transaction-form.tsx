"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface TransactionFormProps {
  type: "income" | "expense"
  onSubmit: () => void
  onCancel: () => void
}

const categories = {
  income: [
    { value: "salary", label: "Salário", subcategories: ["Salário Principal", "Bonificação", "13º Salário"] },
    { value: "freelance", label: "Freelance", subcategories: ["Projetos", "Consultoria", "Serviços"] },
    { value: "investment", label: "Investimentos", subcategories: ["Dividendos", "Juros", "Rendimentos"] },
    { value: "other", label: "Outros", subcategories: ["Vendas", "Presentes", "Diversos"] },
  ],
  expense: [
    { value: "food", label: "Alimentação", subcategories: ["Supermercado", "Restaurante", "Delivery"] },
    { value: "transport", label: "Transporte", subcategories: ["Combustível", "Transporte Público", "Uber"] },
    { value: "housing", label: "Moradia", subcategories: ["Aluguel", "Condomínio", "Utilities"] },
    { value: "health", label: "Saúde", subcategories: ["Médico", "Farmácia", "Academia"] },
    { value: "entertainment", label: "Lazer", subcategories: ["Cinema", "Viagens", "Hobbies"] },
    { value: "other", label: "Outros", subcategories: ["Diversos", "Emergência", "Presentes"] },
  ],
}

const accounts = [
  { value: "checking", label: "Conta Corrente" },
  { value: "savings", label: "Conta Poupança" },
  { value: "credit", label: "Cartão de Crédito" },
  { value: "debit", label: "Cartão de Débito" },
]

export function TransactionForm({ type, onSubmit, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    subcategory: "",
    account: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    user: "João Silva",
  })

  const [selectedCategory, setSelectedCategory] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Transaction submitted:", formData)
    onSubmit()
  }

  const currentCategories = categories[type]
  const subcategories = currentCategories.find((cat) => cat.value === selectedCategory)?.subcategories || []

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ex: Compra no supermercado"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0,00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value)
              setFormData({ ...formData, category: value, subcategory: "" })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {currentCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategoria</Label>
          <Select
            value={formData.subcategory}
            onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
            disabled={!selectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma subcategoria" />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="account">Conta</Label>
          <Select value={formData.account} onValueChange={(value) => setFormData({ ...formData, account: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma conta" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.value} value={account.value}>
                  {account.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="user">Usuário</Label>
        <Input
          id="user"
          value={formData.user}
          onChange={(e) => setFormData({ ...formData, user: e.target.value })}
          placeholder="Nome do usuário"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Observações adicionais (opcional)"
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className={type === "income" ? "bg-green-600 hover:bg-green-700" : ""}>
          Salvar {type === "income" ? "Receita" : "Despesa"}
        </Button>
      </div>
    </form>
  )
}
