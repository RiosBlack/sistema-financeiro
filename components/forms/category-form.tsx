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
import { ColorPicker } from "@/components/ui/color-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

const iconCategories = {
  "🏠 Casa e Moradia": ["🏠", "🏡", "🏢", "🏬", "🏪", "🏨", "🏩", "🏯", "🏰", "⛪"],
  "🍔 Alimentação": ["🍔", "🍕", "🌮", "🌯", "🥗", "🍜", "🍝", "🍱", "🍣", "🍤", "🍰", "🧁", "🍪", "🍫", "☕", "🥤", "🍷", "🍺"],
  "🚗 Transporte": ["🚗", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "✈️", "🚁", "🚢", "⛽"],
  "🛒 Compras": ["🛒", "🛍️", "💳", "💰", "💵", "💸", "💎", "👕", "👗", "👠", "👜", "💼", "⌚", "📱", "💻", "📺", "🎮", "📚"],
  "🏥 Saúde": ["🏥", "⚕️", "💊", "💉", "🩺", "🧬", "🦷", "👁️", "🦴", "🧠", "❤️", "🫀", "🫁", "🦵", "🦶"],
  "🎬 Entretenimento": ["🎬", "🎭", "🎪", "🎨", "🎵", "🎶", "🎤", "🎧", "🎸", "🥁", "🎹", "🎺", "🎻", "🎲", "🃏", "🎯", "🎳", "🎮", "🕹️"],
  "🏋️ Esportes": ["🏋️", "🏃", "🚴", "🏊", "🏄", "🏇", "⛷️", "🏂", "🏌️", "🏓", "🏸", "🏒", "🏑", "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉"],
  "📚 Educação": ["📚", "📖", "📝", "✏️", "🖊️", "🖋️", "✒️", "📏", "📐", "🧮", "🔬", "🔭", "📡", "💡", "🔍", "🔎", "🧪", "⚗️", "🧬"],
  "🔧 Serviços": ["🔧", "🔨", "⚒️", "🛠️", "⚙️", "🔩", "⚖️", "🛡️", "🔫", "💣", "🧨", "🪓", "🪚", "🔪", "🗡️", "⚔️", "🛡️", "🏹", "🪃"],
  "🎁 Outros": ["🎁", "🎀", "🎊", "🎉", "🎈", "🎂", "🍾", "🥂", "🍻", "🌹", "🌺", "🌻", "🌷", "🌸", "🌼", "🌿", "🍀", "🌱", "🌳", "🌲"]
}

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
            <Tabs defaultValue="🏠 Casa e Moradia" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 h-auto">
                {Object.keys(iconCategories).map((categoryName) => (
                  <TabsTrigger key={categoryName} value={categoryName} className="text-xs p-2">
                    {categoryName}
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.entries(iconCategories).map(([categoryName, icons]) => (
                <TabsContent key={categoryName} value={categoryName} className="mt-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{categoryName}</p>
                    <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {icons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setValue("icon", icon)}
                          className={`w-10 h-10 text-lg rounded flex items-center justify-center transition-all ${
                            selectedIcon === icon
                              ? "border-2 border-blue-500 bg-blue-50"
                              : "border-2 border-transparent hover:border-gray-300"
                          }`}
                          title={icon}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            <Input
              {...register("icon")}
              placeholder="Ou digite um emoji"
              className="mt-2"
            />
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <ColorPicker
              value={selectedColor || "#6b7280"}
              onChange={(color) => setValue("color", color)}
              label="Cor"
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