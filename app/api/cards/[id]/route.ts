import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";

// GET - Buscar cartão específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const card = await prisma.card.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            institution: true,
          },
        },
        transactions: {
          take: 10,
          orderBy: { date: "desc" },
          include: {
            category: true,
          },
        },
      },
    });

    if (!card) {
      return errorResponse("Cartão não encontrado", 404);
    }

    return successResponse(card);
  } catch (error) {
    console.error("Erro ao buscar cartão:", error);
    return errorResponse("Erro ao buscar cartão");
  }
}

// PATCH - Atualizar cartão
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar se cartão pertence ao usuário
    const existingCard = await prisma.card.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingCard) {
      return errorResponse("Cartão não encontrado", 404);
    }

    const body = await request.json();
    const {
      name,
      lastDigits,
      type,
      brand,
      limit,
      dueDay,
      closingDay,
      color,
      isActive,
      bankAccountId,
    } = body;

    // Se está mudando bankAccountId, verificar acesso
    if (bankAccountId && bankAccountId !== existingCard.bankAccountId) {
      const hasAccess = await prisma.userBankAccount.findFirst({
        where: {
          bankAccountId,
          userId: user.id,
        },
      });

      if (!hasAccess) {
        return errorResponse("Você não tem acesso a esta conta bancária", 403);
      }
    }

    const card = await prisma.card.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(lastDigits && { lastDigits }),
        ...(type && { type }),
        ...(brand !== undefined && { brand }),
        ...(limit !== undefined && { limit }),
        ...(dueDay !== undefined && { dueDay }),
        ...(closingDay !== undefined && { closingDay }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
        ...(bankAccountId !== undefined && { bankAccountId }),
      },
      include: {
        bankAccount: {
          select: {
            id: true,
            name: true,
            institution: true,
          },
        },
      },
    });

    return successResponse(card);
  } catch (error) {
    console.error("Erro ao atualizar cartão:", error);
    return errorResponse("Erro ao atualizar cartão");
  }
}

// DELETE - Deletar cartão
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar se cartão pertence ao usuário
    const card = await prisma.card.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!card) {
      return errorResponse("Cartão não encontrado", 404);
    }

    // Verificar se há transações
    const transactionCount = await prisma.transaction.count({
      where: { cardId: params.id },
    });

    if (transactionCount > 0) {
      // Desativar ao invés de deletar se houver transações
      await prisma.card.update({
        where: { id: params.id },
        data: { isActive: false },
      });
      return successResponse({ message: "Cartão desativado com sucesso" });
    }

    // Deletar cartão se não houver transações
    await prisma.card.delete({
      where: { id: params.id },
    });

    return successResponse({ message: "Cartão deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar cartão:", error);
    return errorResponse("Erro ao deletar cartão");
  }
}

