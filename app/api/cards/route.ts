import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";

// GET - Listar todos os cartões do usuário (próprios e compartilhados por família)
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Buscar família do usuário
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId: user.id },
      select: { familyId: true },
    });

    const cards = await prisma.card.findMany({
      where: {
        OR: [
          // Cartões próprios
          { userId: user.id },
          // Cartões compartilhados por membros da família
          familyMember
            ? {
                isShared: true,
                user: {
                  familyMembers: {
                    some: {
                      familyId: familyMember.familyId,
                    },
                  },
                },
              }
            : {},
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bankAccount: {
          select: {
            id: true,
            name: true,
            institution: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(cards);
  } catch (error) {
    console.error("Erro ao buscar cartões:", error);
    return errorResponse("Erro ao buscar cartões");
  }
}

// POST - Criar novo cartão
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

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
      bankAccountId,
    } = body;

    // Validações
    if (!name || !lastDigits) {
      return errorResponse("Nome e últimos dígitos são obrigatórios", 400);
    }

    if (lastDigits.length !== 4) {
      return errorResponse("Últimos dígitos devem ter 4 caracteres", 400);
    }

    // Se tem bankAccountId, verificar se usuário tem acesso
    if (bankAccountId) {
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

    // Verificar se o usuário está em uma família para auto-compartilhar
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId: user.id },
      select: { familyId: true },
    });

    const isShared = !!familyMember; // Auto-compartilhar se estiver em família

    const card = await prisma.card.create({
      data: {
        name,
        lastDigits,
        type: type || "CREDIT",
        brand,
        limit,
        dueDay,
        closingDay,
        color,
        isShared,
        userId: user.id,
        bankAccountId,
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

    return successResponse(card, 201);
  } catch (error) {
    console.error("Erro ao criar cartão:", error);
    return errorResponse("Erro ao criar cartão");
  }
}

