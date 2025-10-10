import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

// GET - Buscar todos os dados financeiros de um membro da família
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Verificar se o usuário autenticado está na mesma família que o userId solicitado
    const currentUserFamily = await prisma.familyMember.findFirst({
      where: { userId: session.user.id },
      select: { familyId: true },
    });

    if (!currentUserFamily) {
      return NextResponse.json(
        { error: "Você não está em uma família" },
        { status: 403 }
      );
    }

    const targetUserFamily = await prisma.familyMember.findFirst({
      where: { userId: userId },
      select: { familyId: true },
    });

    if (!targetUserFamily || targetUserFamily.familyId !== currentUserFamily.familyId) {
      return NextResponse.json(
        { error: "Este usuário não está na sua família" },
        { status: 403 }
      );
    }

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Buscar contas bancárias compartilhadas
    const accounts = await prisma.bankAccount.findMany({
      where: {
        createdById: userId,
        isShared: true,
      },
      include: {
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

    // Buscar cartões compartilhados
    const cards = await prisma.card.findMany({
      where: {
        userId: userId,
        isShared: true,
      },
      include: {
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

    // Buscar transações compartilhadas
    const transactionWhere: any = {
      userId: userId,
      isShared: true,
      currentInstallment: { not: 0 }, // Excluir transações pai
    };

    if (startDate && endDate) {
      transactionWhere.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: transactionWhere,
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
      },
      orderBy: {
        date: "desc",
      },
      take: 100, // Limitar a 100 transações mais recentes
    });

    // Buscar metas compartilhadas
    const goals = await prisma.goal.findMany({
      where: {
        createdById: userId,
        isShared: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Buscar categorias personalizadas compartilhadas
    const categories = await prisma.category.findMany({
      where: {
        createdById: userId,
        isShared: true,
        isDefault: false,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      user,
      accounts,
      cards,
      transactions,
      goals,
      categories,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do membro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do membro" },
      { status: 500 }
    );
  }
}

