import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";

// GET - Listar orçamentos do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: any = {
      userId: user.id,
    };

    if (month) {
      where.month = parseInt(month);
    }

    if (year) {
      where.year = parseInt(year);
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
    });

    // Calcular gastos reais para cada orçamento
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
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

        return {
          ...budget,
          spent: spent._sum.amount || 0,
          remaining: budget.amount.toNumber() - (spent._sum.amount?.toNumber() || 0),
          percentageUsed: spent._sum.amount
            ? (spent._sum.amount.toNumber() / budget.amount.toNumber()) * 100
            : 0,
        };
      })
    );

    return successResponse(budgetsWithSpent);
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error);
    return errorResponse("Erro ao buscar orçamentos");
  }
}

// POST - Criar novo orçamento
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { categoryId, amount, month, year } = body;

    // Validações
    if (!categoryId || !amount || !month || !year) {
      return errorResponse(
        "Categoria, valor, mês e ano são obrigatórios",
        400
      );
    }

    if (parseFloat(amount) <= 0) {
      return errorResponse("Valor deve ser maior que zero", 400);
    }

    if (month < 1 || month > 12) {
      return errorResponse("Mês deve estar entre 1 e 12", 400);
    }

    // Verificar se categoria existe
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        type: "EXPENSE", // Orçamento só faz sentido para despesas
        OR: [
          { isDefault: true },
          { createdById: user.id },
        ],
      },
    });

    if (!category) {
      return errorResponse("Categoria não encontrada ou inválida", 404);
    }

    // Verificar se já existe orçamento para esta categoria/período
    const existing = await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId: user.id,
          categoryId,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
    });

    if (existing) {
      return errorResponse(
        "Já existe orçamento para esta categoria neste período",
        400
      );
    }

    const budget = await prisma.budget.create({
      data: {
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        userId: user.id,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return successResponse(budget, 201);
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    return errorResponse("Erro ao criar orçamento");
  }
}

