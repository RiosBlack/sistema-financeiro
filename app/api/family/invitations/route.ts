import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

// GET - Listar convites pendentes do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const invitations = await prisma.familyInvitation.findMany({
      where: {
        invitedId: session.user.id,
        status: "PENDING",
      },
      include: {
        family: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Erro ao buscar convites:", error);
    return NextResponse.json(
      { error: "Erro ao buscar convites" },
      { status: 500 }
    );
  }
}

// POST - Enviar convite para outro usuário
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário está em uma família
    const senderMember = await prisma.familyMember.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        family: true,
      },
    });

    if (!senderMember) {
      return NextResponse.json(
        { error: "Você precisa estar em uma família para enviar convites" },
        { status: 400 }
      );
    }

    // Verificar se é OWNER
    if (senderMember.role !== "OWNER") {
      return NextResponse.json(
        { error: "Apenas o criador da família pode enviar convites" },
        { status: 403 }
      );
    }

    // Buscar usuário convidado por email
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Não pode convidar a si mesmo
    if (invitedUser.id === session.user.id) {
      return NextResponse.json(
        { error: "Você não pode convidar a si mesmo" },
        { status: 400 }
      );
    }

    // Verificar se o usuário já está em uma família
    const existingMember = await prisma.familyMember.findFirst({
      where: {
        userId: invitedUser.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Este usuário já está em uma família" },
        { status: 400 }
      );
    }

    // Verificar se já existe um convite pendente
    const existingInvitation = await prisma.familyInvitation.findUnique({
      where: {
        familyId_invitedId: {
          familyId: senderMember.familyId,
          invitedId: invitedUser.id,
        },
      },
    });

    if (existingInvitation) {
      if (existingInvitation.status === "PENDING") {
        return NextResponse.json(
          { error: "Já existe um convite pendente para este usuário" },
          { status: 400 }
        );
      }

      // Se o convite foi rejeitado, criar um novo
      await prisma.familyInvitation.delete({
        where: {
          id: existingInvitation.id,
        },
      });
    }

    // Criar convite
    const invitation = await prisma.familyInvitation.create({
      data: {
        familyId: senderMember.familyId,
        invitedId: invitedUser.id,
        invitedBy: session.user.id,
      },
      include: {
        family: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        invited: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error("Erro ao enviar convite:", error);
    return NextResponse.json(
      { error: "Erro ao enviar convite" },
      { status: 500 }
    );
  }
}

