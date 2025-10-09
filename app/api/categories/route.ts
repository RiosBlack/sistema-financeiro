import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";

// GET - Listar todas as categorias (padrão + do usuário)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // INCOME ou EXPENSE

    // Buscar família do usuário
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId: user.id },
      select: { familyId: true },
    });

    const categories = await prisma.category.findMany({
      where: {
        AND: [
          {
            OR: [
              { isDefault: true },
              { createdById: user.id },
              // Categorias compartilhadas por membros da família
              familyMember
                ? {
                    isShared: true,
                    createdBy: {
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
          ...(type ? [{ type: type as any }] : []),
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
      orderBy: [
        { isDefault: "desc" },
        { name: "asc" },
      ],
    });

    return successResponse(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return errorResponse("Erro ao buscar categorias");
  }
}

// POST - Criar nova categoria personalizada
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { name, icon, color, type, isShared = false } = body;

    // Validações
    if (!name || !type) {
      return errorResponse("Nome e tipo são obrigatórios", 400);
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return errorResponse("Tipo deve ser INCOME ou EXPENSE", 400);
    }

    // Verificar se já existe categoria com mesmo nome e tipo para este usuário
    const existing = await prisma.category.findFirst({
      where: {
        name,
        type,
        OR: [
          { isDefault: true },
          { createdById: user.id },
        ],
      },
    });

    if (existing) {
      return errorResponse("Já existe uma categoria com este nome e tipo", 400);
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        type,
        isShared,
        createdById: user.id,
        isDefault: false,
      },
    });

    return successResponse(category, 201);
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return errorResponse("Erro ao criar categoria");
  }
}

