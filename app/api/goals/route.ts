import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";

// GET - Listar metas do usuário
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const goals = await prisma.goal.findMany({
      where: {
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
      orderBy: [
        { isCompleted: "asc" },
        { deadline: "asc" },
      ],
    });

    return successResponse(goals);
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    return errorResponse("Erro ao buscar metas");
  }
}

// POST - Criar nova meta
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const {
      name,
      description,
      targetAmount,
      deadline,
      icon,
      color,
      sharedWithUserIds = [],
    } = body;

    // Validações
    if (!name || !targetAmount) {
      return errorResponse("Nome e valor alvo são obrigatórios", 400);
    }

    if (parseFloat(targetAmount) <= 0) {
      return errorResponse("Valor alvo deve ser maior que zero", 400);
    }

    // Criar meta
    const goal = await prisma.goal.create({
      data: {
        name,
        description,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline ? new Date(deadline) : null,
        icon,
        color,
        createdById: user.id,
        users: {
          create: [
            {
              userId: user.id,
              contribution: 0,
            },
            ...sharedWithUserIds.map((userId: string) => ({
              userId,
              contribution: 0,
            })),
          ],
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

    return successResponse(goal, 201);
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    return errorResponse("Erro ao criar meta");
  }
}

