import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

// GET - Buscar família do usuário atual
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar se o usuário é membro de alguma família
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        userId: session.user.id,
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
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: {
                members: true,
                invitations: true,
              },
            },
          },
        },
      },
    });

    if (!familyMember) {
      return NextResponse.json({ family: null });
    }

    return NextResponse.json({
      family: familyMember.family,
      userRole: familyMember.role,
    });
  } catch (error) {
    console.error("Erro ao buscar família:", error);
    return NextResponse.json(
      { error: "Erro ao buscar família" },
      { status: 500 }
    );
  }
}

// POST - Criar nova família
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nome da família é obrigatório" },
        { status: 400 }
      );
    }

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

    // Criar família e adicionar o criador como membro OWNER
    const family = await prisma.family.create({
      data: {
        name,
        createdById: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(family, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar família:", error);
    return NextResponse.json(
      { error: "Erro ao criar família" },
      { status: 500 }
    );
  }
}

// DELETE - Sair da família ou excluir família (se OWNER)
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar membro da família
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        family: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: "Você não está em uma família" },
        { status: 404 }
      );
    }

    // Se for OWNER e for o único membro, excluir a família
    if (
      familyMember.role === "OWNER" &&
      familyMember.family._count.members === 1
    ) {
      await prisma.family.delete({
        where: {
          id: familyMember.familyId,
        },
      });

      return NextResponse.json({
        message: "Família excluída com sucesso",
      });
    }

    // Se for OWNER mas tem outros membros, não pode sair
    if (familyMember.role === "OWNER") {
      return NextResponse.json(
        {
          error:
            "Você não pode sair da família enquanto houver outros membros. Remova todos os membros primeiro.",
        },
        { status: 400 }
      );
    }

    // Se for MEMBER, apenas remover da família
    await prisma.familyMember.delete({
      where: {
        id: familyMember.id,
      },
    });

    return NextResponse.json({
      message: "Você saiu da família com sucesso",
    });
  } catch (error) {
    console.error("Erro ao sair da família:", error);
    return NextResponse.json(
      { error: "Erro ao sair da família" },
      { status: 500 }
    );
  }
}

