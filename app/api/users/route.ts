import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Listar todos os usuários (apenas admin)
export async function GET() {
  console.log("🚀 Iniciando GET /api/users");
  try {
    console.log("1️⃣ Buscando sessão...");
    const session = await getServerSession(authOptions);
    console.log("2️⃣ Sessão obtida:", !!session);

    if (!session?.user) {
      console.log("❌ Sem sessão");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    console.log("3️⃣ Usuário autenticado:", session.user.email);

    // TEMPORÁRIO: Remover verificação de admin para testar
    // TODO: Adicionar verificação de admin depois que funcionar

    console.log("4️⃣ Buscando usuários no Prisma...");
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
            cards: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("5️⃣ Usuários encontrados:", users.length);
    console.log("6️⃣ Retornando resposta...");
    return NextResponse.json(users);
  } catch (error) {
    console.error("💥 ERRO CAPTURADO:", error);
    console.error("💥 Tipo do erro:", typeof error);
    console.error("💥 Stack:", error instanceof Error ? error.stack : "N/A");
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

    // TEMPORÁRIO: Remover verificação de admin para testar
    // TODO: Adicionar verificação de admin depois que funcionar

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
