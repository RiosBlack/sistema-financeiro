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

    const { searchParams } = new URL(request.url);
    const deleteAll = searchParams.get("deleteAll") === "true";

    // Verificar se transação pertence ao usuário
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        childTransactions: true,
        parentTransaction: true,
      },
    });

    if (!transaction) {
      return errorResponse("Transação não encontrada", 404);
    }

    // Se é uma parcela e quer deletar todas
    if (deleteAll && transaction.parentTransactionId) {
      // Buscar todas as parcelas
      const allInstallments = await prisma.transaction.findMany({
        where: {
          parentTransactionId: transaction.parentTransactionId,
        },
      });

      // Reverter saldo de parcelas pagas
      for (const inst of allInstallments) {
        if (inst.isPaid && inst.bankAccountId) {
          await updateBankAccountBalance(
            inst.bankAccountId,
            inst.amount.toNumber(),
            inst.type === "INCOME" ? "EXPENSE" : "INCOME"
          );
        }
      }

      // Deletar todas as parcelas
      await prisma.transaction.deleteMany({
        where: {
          parentTransactionId: transaction.parentTransactionId,
        },
      });

      // Deletar transação pai
      await prisma.transaction.delete({
        where: { id: transaction.parentTransactionId },
      });

      return successResponse({ 
        message: "Todas as parcelas foram deletadas com sucesso",
        deletedCount: allInstallments.length
      });
    }

    // Deletar apenas esta transação/parcela
    // Se foi paga, reverter saldo
    if (transaction.isPaid && transaction.bankAccountId) {
      await updateBankAccountBalance(
        transaction.bankAccountId,
        transaction.amount.toNumber(),
        transaction.type === "INCOME" ? "EXPENSE" : "INCOME"
      );
    }

    // Se é transação pai (currentInstallment = 0), deletar também as filhas
    if (transaction.currentInstallment === 0 && transaction.childTransactions.length > 0) {
      // Reverter saldo de parcelas pagas
      for (const child of transaction.childTransactions) {
        if (child.isPaid && child.bankAccountId) {
          await updateBankAccountBalance(
            child.bankAccountId,
            child.amount.toNumber(),
            child.type === "INCOME" ? "EXPENSE" : "INCOME"
          );
        }
      }

      await prisma.transaction.deleteMany({
        where: {
          parentTransactionId: params.id,
        },
      });
    }

    // Deletar a transação
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

