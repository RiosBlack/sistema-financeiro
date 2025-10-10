import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Listar todos os usuários (apenas admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("📋 Session:", session);
    console.log("👤 Session.user:", session?.user);
    console.log("🆔 Session.user.id:", session?.user?.id);

    if (!session?.user) {
      console.log("❌ Sem sessão ou usuário");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!session.user.id) {
      console.log("❌ session.user.id está undefined!");
      return NextResponse.json({ error: "ID do usuário não encontrado" }, { status: 401 });
    }

    // Verificar se o usuário é admin
    try {
      console.log("🔍 Buscando usuário com ID:", session.user.id);
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true },
      });

      console.log("✅ User verificado:", currentUser);
      console.log("👑 Role do user:", currentUser?.role);

      if (!currentUser || currentUser.role?.name?.toLowerCase() !== "admin") {
        return NextResponse.json(
          {
            error:
              "Acesso negado. Apenas administradores podem acessar esta rota.",
          },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error("Erro ao verificar admin:", error);
      return NextResponse.json(
        { error: "Erro ao verificar permissões" },
        { status: 500 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            bankAccounts: true,
            cards: true,
            goals: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário é admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });

    if (!currentUser || currentUser.role?.name?.toLowerCase() !== "admin") {
      return NextResponse.json(
        {
          error: "Acesso negado. Apenas administradores podem criar usuários.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, roleId } = body;

    // Validações
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        ...(roleId && {
          role: {
            connect: { id: roleId },
          },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
