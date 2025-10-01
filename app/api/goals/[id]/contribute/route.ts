import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";

// POST - Adicionar contribuição à meta
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { amount } = body;

    // Validações
    if (!amount || parseFloat(amount) <= 0) {
      return errorResponse("Valor da contribuição deve ser maior que zero", 400);
    }

    // Verificar se usuário tem acesso à meta
    const userGoal = await prisma.userGoal.findFirst({
      where: {
        goalId: params.id,
        userId: user.id,
      },
      include: {
        goal: true,
      },
    });

    if (!userGoal) {
      return errorResponse("Meta não encontrada", 404);
    }

    const contributionAmount = parseFloat(amount);

    // Atualizar contribuição do usuário
    await prisma.userGoal.update({
      where: { id: userGoal.id },
      data: {
        contribution: {
          increment: contributionAmount,
        },
      },
    });

    // Atualizar valor atual da meta
    const updatedGoal = await prisma.goal.update({
      where: { id: params.id },
      data: {
        currentAmount: {
          increment: contributionAmount,
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
      },
    });

    // Verificar se atingiu a meta
    if (
      updatedGoal.currentAmount.toNumber() >= updatedGoal.targetAmount.toNumber() &&
      !updatedGoal.isCompleted
    ) {
      await prisma.goal.update({
        where: { id: params.id },
        data: { isCompleted: true },
      });
      updatedGoal.isCompleted = true;
    }

    return successResponse(updatedGoal);
  } catch (error) {
    console.error("Erro ao adicionar contribuição:", error);
    return errorResponse("Erro ao adicionar contribuição");
  }
}

