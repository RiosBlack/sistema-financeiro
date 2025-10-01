import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";

// GET - Buscar meta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const goal = await prisma.goal.findFirst({
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
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!goal) {
      return errorResponse("Meta não encontrada", 404);
    }

    return successResponse(goal);
  } catch (error) {
    console.error("Erro ao buscar meta:", error);
    return errorResponse("Erro ao buscar meta");
  }
}

// PATCH - Atualizar meta
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar se usuário tem acesso à meta
    const userGoal = await prisma.userGoal.findFirst({
      where: {
        goalId: params.id,
        userId: user.id,
      },
    });

    if (!userGoal) {
      return errorResponse("Meta não encontrada", 404);
    }

    // Verificar se é criador (apenas criador pode editar dados da meta)
    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
    });

    if (!goal || goal.createdById !== user.id) {
      return errorResponse("Apenas o criador pode editar a meta", 403);
    }

    const body = await request.json();
    const { name, description, targetAmount, deadline, icon, color, isCompleted } = body;

    const updatedGoal = await prisma.goal.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(targetAmount && { targetAmount: parseFloat(targetAmount) }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(isCompleted !== undefined && { isCompleted }),
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

    return successResponse(updatedGoal);
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    return errorResponse("Erro ao atualizar meta");
  }
}

// DELETE - Deletar meta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar se usuário é o criador
    const goal = await prisma.goal.findFirst({
      where: {
        id: params.id,
        createdById: user.id,
      },
    });

    if (!goal) {
      return errorResponse("Meta não encontrada ou você não tem permissão", 404);
    }

    // Deletar meta (userGoals serão deletados em cascata)
    await prisma.goal.delete({
      where: { id: params.id },
    });

    return successResponse({ message: "Meta deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar meta:", error);
    return errorResponse("Erro ao deletar meta");
  }
}

