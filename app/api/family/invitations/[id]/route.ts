import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

// PATCH - Aceitar ou rejeitar convite
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body; // "accept" ou "reject"

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Ação inválida. Use 'accept' ou 'reject'" },
        { status: 400 }
      );
    }

    // Buscar convite
    const invitation = await prisma.familyInvitation.findUnique({
      where: {
        id: params.id,
      },
      include: {
        family: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Convite não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o convite é para o usuário logado
    if (invitation.invitedId !== session.user.id) {
      return NextResponse.json(
        { error: "Este convite não é para você" },
        { status: 403 }
      );
    }

    // Verificar se o convite ainda está pendente
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Este convite já foi respondido" },
        { status: 400 }
      );
    }

    // Verificar se o convite expirou (30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (invitation.createdAt < thirtyDaysAgo) {
      await prisma.familyInvitation.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          respondedAt: new Date(),
        },
      });

      return NextResponse.json(
        { error: "Este convite expirou" },
        { status: 400 }
      );
    }

    if (action === "reject") {
      // Rejeitar convite
      await prisma.familyInvitation.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          respondedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Convite rejeitado com sucesso",
      });
    }

    // Aceitar convite
    // Verificar se o usuário já está em uma família
    const existingMember = await prisma.familyMember.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Você já está em uma família" },
        { status: 400 }
      );
    }

    // Criar membro e atualizar convite em uma transação
    await prisma.$transaction([
      prisma.familyMember.create({
        data: {
          familyId: invitation.familyId,
          userId: session.user.id,
          role: "MEMBER",
        },
      }),
      prisma.familyInvitation.update({
        where: { id: params.id },
        data: {
          status: "ACCEPTED",
          respondedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      message: "Convite aceito com sucesso",
      familyId: invitation.familyId,
    });
  } catch (error) {
    console.error("Erro ao responder convite:", error);
    return NextResponse.json(
      { error: "Erro ao responder convite" },
      { status: 500 }
    );
  }
}

