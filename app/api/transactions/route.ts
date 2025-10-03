import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";
import { Prisma } from "@/lib/generated/prisma";

// GET - Listar transações do usuário com filtros
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // INCOME ou EXPENSE
    const categoryId = searchParams.get("categoryId");
    const bankAccountId = searchParams.get("bankAccountId");
    const cardId = searchParams.get("cardId");
    const isPaid = searchParams.get("isPaid");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Prisma.TransactionWhereInput = {
      userId: user.id,
      currentInstallment: { not: 0 }, // Excluir transações pai (currentInstallment = 0)
      ...(type && { type: type as any }),
      ...(categoryId && { categoryId }),
      ...(bankAccountId && { bankAccountId }),
      ...(cardId && { cardId }),
      ...(isPaid !== null && isPaid !== undefined && { isPaid: isPaid === "true" }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          bankAccount: {
            select: {
              id: true,
              name: true,
              institution: true,
            },
          },
          card: {
            select: {
              id: true,
              name: true,
              lastDigits: true,
            },
          },
          parentTransaction: {
            select: {
              id: true,
              description: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return successResponse({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return errorResponse("Erro ao buscar transações");
  }
}

// POST - Criar nova transação
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const {
      description,
      amount,
      type,
      date,
      categoryId,
      bankAccountId,
      cardId,
      isPaid,
      isRecurring,
      recurringType,
      installments,
      notes,
    } = body;

    // Validações
    if (!description || !amount || !type || !categoryId) {
      return errorResponse(
        "Descrição, valor, tipo e categoria são obrigatórios",
        400
      );
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return errorResponse("Tipo deve ser INCOME ou EXPENSE", 400);
    }

    // Verificar se categoria existe
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [
          { isDefault: true },
          { createdById: user.id },
        ],
      },
    });

    if (!category) {
      return errorResponse("Categoria não encontrada", 404);
    }

    // Verificar acesso à conta bancária se fornecida
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

    // Verificar se cartão pertence ao usuário
    if (cardId) {
      const card = await prisma.card.findFirst({
        where: {
          id: cardId,
          userId: user.id,
        },
      });

      if (!card) {
        return errorResponse("Cartão não encontrado", 404);
      }
    }

    // Se tem parcelamento, criar transação pai e filhas
    if (installments && installments > 1) {
      const parentTransaction = await prisma.transaction.create({
        data: {
          description: `${description} (${installments}x)`,
          amount: parseFloat(amount),
          type,
          date: date ? new Date(date) : new Date(),
          categoryId,
          bankAccountId: bankAccountId || undefined,
          cardId: cardId || undefined,
          isPaid: false,
          isRecurring: false,
          installments,
          currentInstallment: 0, // Transação pai
          userId: user.id,
          notes: notes || undefined,
        },
        include: {
          category: true,
          bankAccount: true,
          card: true,
        },
      });

      // Criar transações filhas (parcelas)
      const installmentAmount = parseFloat(amount) / installments;
      const installmentTransactions = [];

      for (let i = 1; i <= installments; i++) {
        const installmentDate = new Date(date || new Date());
        installmentDate.setMonth(installmentDate.getMonth() + (i - 1));

        const installmentTx = await prisma.transaction.create({
          data: {
            description: `${description} (${i}/${installments})`,
            amount: installmentAmount,
            type,
            date: installmentDate,
            categoryId,
            bankAccountId: bankAccountId || undefined,
            cardId: cardId || undefined,
            isPaid: i === 1 && isPaid ? true : false,
            isRecurring: false,
            installments,
            currentInstallment: i,
            parentTransactionId: parentTransaction.id,
            userId: user.id,
            notes: notes || undefined,
          },
        });

        installmentTransactions.push(installmentTx);
      }

      return successResponse(
        {
          parent: parentTransaction,
          installments: installmentTransactions,
        },
        201
      );
    }

    // Transação única
    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount: parseFloat(amount),
        type,
        date: date ? new Date(date) : new Date(),
        categoryId,
        bankAccountId: bankAccountId || undefined,
        cardId: cardId || undefined,
        isPaid: isPaid || false,
        isRecurring: isRecurring || false,
        recurringType: recurringType || undefined,
        installments: 1,
        currentInstallment: 1,
        userId: user.id,
        notes: notes || undefined,
      },
      include: {
        category: true,
        bankAccount: true,
        card: true,
      },
    });

    // Atualizar saldo da conta se transação foi paga
    if (isPaid && bankAccountId) {
      await updateBankAccountBalance(bankAccountId, parseFloat(amount), type);
    }

    return successResponse(transaction, 201);
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return errorResponse("Erro ao criar transação");
  }
}

// Helper para atualizar saldo da conta
async function updateBankAccountBalance(
  bankAccountId: string,
  amount: number,
  type: string
) {
  const account = await prisma.bankAccount.findUnique({
    where: { id: bankAccountId },
  });

  if (account) {
    const newBalance =
      type === "INCOME"
        ? account.currentBalance.toNumber() + amount
        : account.currentBalance.toNumber() - amount;

    await prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: { currentBalance: newBalance },
    });
  }
}

