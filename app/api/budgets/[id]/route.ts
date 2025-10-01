import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";

// GET - Buscar orçamento específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    if (!budget) {
      return errorResponse("Orçamento não encontrado", 404);
    }

    // Calcular gastos reais
    const spent = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        categoryId: budget.categoryId,
        type: "EXPENSE",
        isPaid: true,
        date: {
          gte: new Date(budget.year, budget.month - 1, 1),
          lt: new Date(budget.year, budget.month, 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const budgetWithSpent = {
      ...budget,
      spent: spent._sum.amount || 0,
      remaining: budget.amount.toNumber() - (spent._sum.amount?.toNumber() || 0),
      percentageUsed: spent._sum.amount
        ? (spent._sum.amount.toNumber() / budget.amount.toNumber()) * 100
        : 0,
    };

    return successResponse(budgetWithSpent);
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    return errorResponse("Erro ao buscar orçamento");
  }
}

// PATCH - Atualizar orçamento
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar se orçamento pertence ao usuário
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingBudget) {
      return errorResponse("Orçamento não encontrado", 404);
    }

    const body = await request.json();
    const { amount } = body;

    // Validação
    if (amount && parseFloat(amount) <= 0) {
      return errorResponse("Valor deve ser maior que zero", 400);
    }

    const budget = await prisma.budget.update({
      where: { id: params.id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
      },
      include: {
        category: true,
      },
    });

    return successResponse(budget);
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error);
    return errorResponse("Erro ao atualizar orçamento");
  }
}

// DELETE - Deletar orçamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar se orçamento pertence ao usuário
    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!budget) {
      return errorResponse("Orçamento não encontrado", 404);
    }

    // Deletar orçamento
    await prisma.budget.delete({
      where: { id: params.id },
    });

    return successResponse({ message: "Orçamento deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar orçamento:", error);
    return errorResponse("Erro ao deletar orçamento");
  }
}

