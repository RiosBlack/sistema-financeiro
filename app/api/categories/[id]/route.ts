import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";

// GET - Buscar categoria específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const category = await prisma.category.findFirst({
      where: {
        id: params.id,
        OR: [
          { isDefault: true },
          { createdById: user.id },
        ],
      },
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });

    if (!category) {
      return errorResponse("Categoria não encontrada", 404);
    }

    return successResponse(category);
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return errorResponse("Erro ao buscar categoria");
  }
}

// PATCH - Atualizar categoria (apenas categorias personalizadas)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar se categoria existe e pertence ao usuário
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: params.id,
        createdById: user.id,
        isDefault: false,
      },
    });

    if (!existingCategory) {
      return errorResponse("Categoria não encontrada ou não pode ser editada", 404);
    }

    const body = await request.json();
    const { name, icon, color } = body;

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
      },
    });

    return successResponse(category);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return errorResponse("Erro ao atualizar categoria");
  }
}

// DELETE - Deletar categoria (apenas categorias personalizadas)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar se categoria existe e pertence ao usuário
    const category = await prisma.category.findFirst({
      where: {
        id: params.id,
        createdById: user.id,
        isDefault: false,
      },
    });

    if (!category) {
      return errorResponse("Categoria não encontrada ou não pode ser deletada", 404);
    }

    // Verificar se há transações usando esta categoria
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: params.id },
    });

    if (transactionCount > 0) {
      return errorResponse(
        "Não é possível deletar categoria com transações associadas",
        400
      );
    }

    // Deletar categoria
    await prisma.category.delete({
      where: { id: params.id },
    });

    return successResponse({ message: "Categoria deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    return errorResponse("Erro ao deletar categoria");
  }
}

