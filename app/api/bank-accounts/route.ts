import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";

// GET - Listar todas as contas do usuário
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const accounts = await prisma.bankAccount.findMany({
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
        _count: {
          select: {
            transactions: true,
            cards: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(accounts);
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    return errorResponse("Erro ao buscar contas bancárias");
  }
}

// POST - Criar nova conta bancária
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const {
      name,
      institution,
      type,
      initialBalance,
      color,
      sharedWithUserIds = [], // IDs de usuários para compartilhar a conta
    } = body;

    // Validações
    if (!name || !institution) {
      return errorResponse("Nome e instituição são obrigatórios", 400);
    }

    // Criar conta bancária
    const account = await prisma.bankAccount.create({
      data: {
        name,
        institution,
        type: type || "CHECKING",
        initialBalance: initialBalance || 0,
        currentBalance: initialBalance || 0,
        color,
        createdById: user.id,
        users: {
          create: [
            // Criador da conta como OWNER
            {
              userId: user.id,
              role: "OWNER",
            },
            // Outros usuários como MEMBER
            ...sharedWithUserIds.map((userId: string) => ({
              userId,
              role: "MEMBER" as const,
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

    return successResponse(account, 201);
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return errorResponse("Erro ao criar conta bancária");
  }
}

