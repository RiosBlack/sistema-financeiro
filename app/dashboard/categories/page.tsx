"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryForm } from "@/components/forms/category-form"
import { Plus, Loader2, Edit, Trash2, Eye } from "lucide-react"
import { useCategoriesStore } from "@/store/use-categories-store"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Category, TransactionType } from "@/types/api"
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

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  })
  const [viewDialog, setViewDialog] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  })

  const { 
    categories, 
    loading, 
    fetchCategories, 
    deleteCategory 
  } = useCategoriesStore()
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDeleteCategory = (category: Category) => {
    setDeleteDialog({ open: true, category })
  }

  const handleViewCategory = (category: Category) => {
    setViewDialog({ open: true, category })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.category) return

    try {
      await deleteCategory(deleteDialog.category.id)
      toast({
        title: "Categoria removida!",
        description: "A categoria foi removida com sucesso.",
      })
      setDeleteDialog({ open: false, category: null })
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao deletar a categoria.",
        variant: "destructive",
      })
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "all") {
      fetchCategories()
    } else {
      fetchCategories(value as TransactionType)
    }
  }

  const filteredCategories = categories.filter(category => {
    if (activeTab === "all") return true
    return category.type === activeTab
  })

  const incomeCategories = categories.filter(c => c.type === "INCOME")
  const expenseCategories = categories.filter(c => c.type === "EXPENSE")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">Gerencie suas categorias de receitas e despesas</p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {showForm && (
        <CategoryForm
          category={editingCategory || undefined}
          onCancel={() => {
            setShowForm(false)
            setEditingCategory(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setEditingCategory(null)
            fetchCategories()
          }}
        />
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({categories.length})</TabsTrigger>
          <TabsTrigger value="INCOME">
            Receitas ({incomeCategories.length})
          </TabsTrigger>
          <TabsTrigger value="EXPENSE">
            Despesas ({expenseCategories.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">Nenhuma categoria encontrada</p>
                <Button onClick={handleAddCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeira categoria
                </Button>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <Card key={category.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon || "📁"}</span>
                        <div>
                          <CardTitle className="text-lg" style={{ color: category.color || "#6b7280" }}>
                            {category.name}
                          </CardTitle>
                          <CardDescription>
                            {category.type === "INCOME" ? "Receita" : "Despesa"}
                          </CardDescription>
                        </div>
                      </div>
                      {category.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Padrão
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Transações:</span>
                        <span className="font-medium">
                          {category._count?.transactions || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Orçamentos:</span>
                        <span className="font-medium">
                          {category._count?.budgets || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCategory(category)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!category.isDefault && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de visualização */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, category: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Categoria</DialogTitle>
            <DialogDescription>
              Informações completas sobre a categoria
            </DialogDescription>
          </DialogHeader>
          {viewDialog.category && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{viewDialog.category.icon || "📁"}</span>
                <div>
                  <h3 
                    className="text-xl font-semibold"
                    style={{ color: viewDialog.category.color || "#6b7280" }}
                  >
                    {viewDialog.category.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {viewDialog.category.type === "INCOME" ? "Receita" : "Despesa"}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Transações</p>
                  <p className="text-2xl font-bold">
                    {viewDialog.category._count?.transactions || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Orçamentos</p>
                  <p className="text-2xl font-bold">
                    {viewDialog.category._count?.budgets || 0}
                  </p>
                </div>
              </div>

              {viewDialog.category.isDefault && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Esta é uma categoria padrão do sistema e não pode ser editada ou removida.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, category: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>Tem certeza que deseja excluir a categoria <strong>{deleteDialog.category?.name}</strong>?</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Esta ação não pode ser desfeita. Se houver transações associadas a esta categoria, a exclusão será negada.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
