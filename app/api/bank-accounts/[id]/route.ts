import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";

// GET - Buscar conta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const account = await prisma.bankAccount.findFirst({
      where: {
        id: params.id,
        users: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        cards: {
          where: { isActive: true },
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

    if (!account) {
      return errorResponse("Conta não encontrada", 404);
    }

    return successResponse(account);
  } catch (error) {
    console.error("Erro ao buscar conta:", error);
    return errorResponse("Erro ao buscar conta bancária");
  }
}

// PATCH - Atualizar conta
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar se usuário tem permissão (OWNER)
    const userAccount = await prisma.userBankAccount.findFirst({
      where: {
        bankAccountId: params.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    if (!userAccount) {
      return errorResponse("Apenas o proprietário pode editar a conta", 403);
    }

    const body = await request.json();
    const { name, institution, type, color, isActive } = body;

    const account = await prisma.bankAccount.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(institution && { institution }),
        ...(type && { type }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return successResponse(account);
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
    return errorResponse("Erro ao atualizar conta bancária");
  }
}

// DELETE - Deletar conta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar se usuário é OWNER
    const userAccount = await prisma.userBankAccount.findFirst({
      where: {
        bankAccountId: params.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    if (!userAccount) {
      return errorResponse("Apenas o proprietário pode deletar a conta", 403);
    }

    // Verificar se há transações
    const transactionCount = await prisma.transaction.count({
      where: { bankAccountId: params.id },
    });

    if (transactionCount > 0) {
      // Desativar ao invés de deletar se houver transações
      await prisma.bankAccount.update({
        where: { id: params.id },
        data: { isActive: false },
      });
      return successResponse({ message: "Conta desativada com sucesso" });
    }

    // Deletar conta se não houver transações
    await prisma.bankAccount.delete({
      where: { id: params.id },
    });

    return successResponse({ message: "Conta deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    return errorResponse("Erro ao deletar conta bancária");
  }
}

