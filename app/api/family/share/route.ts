import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

// POST - Compartilhar/descompartilhar item
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { type, itemId, shared } = body;

    if (!type || !itemId || typeof shared !== "boolean") {
      return NextResponse.json(
        { error: "Tipo, ID do item e estado de compartilhamento são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o usuário está em uma família
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!familyMember && shared) {
      return NextResponse.json(
        { error: "Você precisa estar em uma família para compartilhar itens" },
        { status: 400 }
      );
    }

    // Atualizar o item baseado no tipo
    let updatedItem;

    switch (type) {
      case "bankAccount":
        // Verificar se a conta pertence ao usuário
        const account = await prisma.bankAccount.findUnique({
          where: { id: itemId },
        });

        if (!account || account.createdById !== session.user.id) {
          return NextResponse.json(
            { error: "Conta não encontrada ou você não tem permissão" },
            { status: 403 }
          );
        }

        updatedItem = await prisma.bankAccount.update({
          where: { id: itemId },
          data: { isShared: shared },
        });
        break;

      case "card":
        // Verificar se o cartão pertence ao usuário
        const card = await prisma.card.findUnique({
          where: { id: itemId },
        });

        if (!card || card.userId !== session.user.id) {
          return NextResponse.json(
            { error: "Cartão não encontrado ou você não tem permissão" },
            { status: 403 }
          );
        }

        updatedItem = await prisma.card.update({
          where: { id: itemId },
          data: { isShared: shared },
        });
        break;

      case "category":
        // Verificar se a categoria pertence ao usuário
        const category = await prisma.category.findUnique({
          where: { id: itemId },
        });

        if (!category || category.createdById !== session.user.id) {
          return NextResponse.json(
            { error: "Categoria não encontrada ou você não tem permissão" },
            { status: 403 }
          );
        }

        updatedItem = await prisma.category.update({
          where: { id: itemId },
          data: { isShared: shared },
        });
        break;

      case "transaction":
        // Verificar se a transação pertence ao usuário
        const transaction = await prisma.transaction.findUnique({
          where: { id: itemId },
        });

        if (!transaction || transaction.userId !== session.user.id) {
          return NextResponse.json(
            { error: "Transação não encontrada ou você não tem permissão" },
            { status: 403 }
          );
        }

        updatedItem = await prisma.transaction.update({
          where: { id: itemId },
          data: { isShared: shared },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Tipo de item inválido" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: shared
        ? "Item compartilhado com sucesso"
        : "Compartilhamento removido com sucesso",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Erro ao compartilhar item:", error);
    return NextResponse.json(
      { error: "Erro ao compartilhar item" },
      { status: 500 }
    );
  }
}

