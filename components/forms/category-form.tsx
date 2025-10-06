"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCategoriesStore } from "@/store/use-categories-store"
import { useToast } from "@/hooks/use-toast"
import { Category, TransactionType } from "@/types/api"
import { Loader2, X } from "lucide-react"

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(50, "Nome deve ter no máximo 50 caracteres"),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Tipo é obrigatório",
  }),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category?: Category
  onCancel: () => void
  onSuccess: () => void
}

const iconOptions = [
  "🏠", "🍔", "🚗", "⛽", "🛒", "💊", "🎬", "🏋️", "📚", "🎮",
  "👕", "✈️", "🏨", "🍕", "☕", "🍰", "🎁", "💡", "🔧", "📱",
  "💻", "🎵", "📺", "🏥", "💳", "💰", "💵", "💸", "📊", "📈"
]

const colorOptions = [
  { value: "#ef4444", label: "Vermelho" },
  { value: "#f97316", label: "Laranja" },
  { value: "#eab308", label: "Amarelo" },
  { value: "#22c55e", label: "Verde" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#6b7280", label: "Cinza" },
  { value: "#000000", label: "Preto" },
]

export function CategoryForm({ category, onCancel, onSuccess }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createCategory, editCategory } = useCategoriesStore()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      icon: category?.icon || "",
      color: category?.color || "#6b7280",
      type: category?.type || "EXPENSE",
    },
  })

  const selectedType = watch("type")
  const selectedIcon = watch("icon")
  const selectedColor = watch("color")

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    try {
      if (category) {
        await editCategory(category.id, {
          name: data.name,
          icon: data.icon,
          color: data.color,
        })
        toast({
          title: "Categoria atualizada!",
          description: "A categoria foi atualizada com sucesso.",
        })
      } else {
        await createCategory({
          name: data.name,
          icon: data.icon,
          color: data.color,
          type: data.type,
        })
        toast({
          title: "Categoria criada!",
          description: "A categoria foi criada com sucesso.",
        })
      }
      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {category ? "Editar Categoria" : "Nova Categoria"}
            </CardTitle>
            <CardDescription>
              {category 
                ? "Atualize as informações da categoria" 
                : "Adicione uma nova categoria personalizada"
              }
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Alimentação, Salário, etc."
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Tipo (apenas para criação) */}
          {!category && (
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setValue("type", value as TransactionType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                  <SelectItem value="INCOME">Receita</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>
          )}

          {/* Ícone */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-10 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue("icon", icon)}
                  className={`w-10 h-10 text-lg rounded border-2 flex items-center justify-center transition-colors ${
                    selectedIcon === icon
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <Input
              {...register("icon")}
              placeholder="Ou digite um emoji"
              className="mt-2"
            />
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setValue("color", color.value)}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    selectedColor === color.value
                      ? "border-gray-800 scale-110"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
            <Input
              {...register("color")}
              placeholder="#6b7280"
              className="mt-2"
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <span className="text-lg">{selectedIcon || "📁"}</span>
              <span 
                className="font-medium"
                style={{ color: selectedColor }}
              >
                {watch("name") || "Nome da categoria"}
              </span>
              <span className="text-sm text-muted-foreground">
                ({selectedType === "INCOME" ? "Receita" : "Despesa"})
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {category ? "Atualizar" : "Criar"} Categoria
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
