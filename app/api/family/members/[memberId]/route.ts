import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

// DELETE - Remover membro da família (apenas OWNER)
export async function DELETE(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário é OWNER da família
    const ownerMember = await prisma.familyMember.findFirst({
      where: {
        userId: session.user.id,
        role: "OWNER",
      },
    });

    if (!ownerMember) {
      return NextResponse.json(
        { error: "Apenas o criador da família pode remover membros" },
        { status: 403 }
      );
    }

    // Buscar o membro a ser removido
    const memberToRemove = await prisma.familyMember.findUnique({
      where: {
        id: params.memberId,
      },
    });

    if (!memberToRemove) {
      return NextResponse.json(
        { error: "Membro não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o membro pertence à mesma família
    if (memberToRemove.familyId !== ownerMember.familyId) {
      return NextResponse.json(
        { error: "Este membro não pertence à sua família" },
        { status: 403 }
      );
    }

    // Não permitir remover a si mesmo
    if (memberToRemove.userId === session.user.id) {
      return NextResponse.json(
        { error: "Você não pode remover a si mesmo da família" },
        { status: 400 }
      );
    }

    // Remover o membro
    await prisma.familyMember.delete({
      where: {
        id: params.memberId,
      },
    });

    return NextResponse.json({
      message: "Membro removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    return NextResponse.json(
      { error: "Erro ao remover membro" },
      { status: 500 }
    );
  }
}

