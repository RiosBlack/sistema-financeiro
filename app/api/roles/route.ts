import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

// GET - Listar todas as roles
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Erro ao buscar roles:", error);
    return NextResponse.json(
      { error: "Erro ao buscar roles" },
      { status: 500 }
    );
  }
}

