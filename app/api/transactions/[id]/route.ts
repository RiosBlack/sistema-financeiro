import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth";

// GET - Buscar transação específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        category: true,
        bankAccount: true,
        card: true,
        parentTransaction: true,
        childTransactions: {
          orderBy: { currentInstallment: "asc" },
        },
      },
    });

    if (!transaction) {
      return errorResponse("Transação não encontrada", 404);
    }

    return successResponse(transaction);
  } catch (error) {
    console.error("Erro ao buscar transação:", error);
    return errorResponse("Erro ao buscar transação");
  }
}

// PATCH - Atualizar transação
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar se transação pertence ao usuário
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingTransaction) {
      return errorResponse("Transação não encontrada", 404);
    }

    const body = await request.json();
    const {
      description,
      amount,
      date,
      categoryId,
      bankAccountId,
      cardId,
      isPaid,
      notes,
    } = body;

    // Atualizar saldo se status de pagamento mudou
    if (
      isPaid !== undefined &&
      isPaid !== existingTransaction.isPaid &&
      existingTransaction.bankAccountId
    ) {
      const amountValue = amount || existingTransaction.amount.toNumber();
      const type = existingTransaction.type;

      if (isPaid) {
        // Marcou como pago - deduzir/adicionar do saldo
        await updateBankAccountBalance(
          existingTransaction.bankAccountId,
          amountValue,
          type
        );
      } else {
        // Desmarcou como pago - reverter saldo
        await updateBankAccountBalance(
          existingTransaction.bankAccountId,
          amountValue,
          type === "INCOME" ? "EXPENSE" : "INCOME" // Inverter tipo para reverter
        );
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        ...(description && { description }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(date && { date: new Date(date) }),
        ...(categoryId && { categoryId }),
        ...(bankAccountId !== undefined && { bankAccountId }),
        ...(cardId !== undefined && { cardId }),
        ...(isPaid !== undefined && { isPaid }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        category: true,
        bankAccount: true,
        card: true,
      },
    });

    return successResponse(transaction);
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    return errorResponse("Erro ao atualizar transação");
  }
}

// DELETE - Deletar transação
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Verificar se transação pertence ao usuário
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        childTransactions: true,
      },
    });

    if (!transaction) {
      return errorResponse("Transação não encontrada", 404);
    }

    // Se foi paga, reverter saldo
    if (transaction.isPaid && transaction.bankAccountId) {
      await updateBankAccountBalance(
        transaction.bankAccountId,
        transaction.amount.toNumber(),
        transaction.type === "INCOME" ? "EXPENSE" : "INCOME" // Inverter para reverter
      );
    }

    // Se é transação parcelada (pai), deletar todas as parcelas
    if (transaction.childTransactions.length > 0) {
      await prisma.transaction.deleteMany({
        where: {
          parentTransactionId: params.id,
        },
      });
    }

    // Deletar transação
    await prisma.transaction.delete({
      where: { id: params.id },
    });

    return successResponse({ message: "Transação deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    return errorResponse("Erro ao deletar transação");
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

