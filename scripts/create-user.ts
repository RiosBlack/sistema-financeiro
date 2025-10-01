import { PrismaClient } from '../lib/generated/prisma/index.js';
import * as readline from 'readline';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createRole(name: string, description: string) {
  try {
    const role = await prisma.role.create({
      data: {
        name,
        description
      }
    });
    console.log('Role criada com sucesso:', role);
    return role;
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      console.log('Role já existe');
      return await prisma.role.findUnique({ where: { name } });
    }
    if (error instanceof Error) {
      throw new Error(`Erro ao criar role: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao criar role');
  }
}

async function createUser(email: string, name: string, password: string, roleName: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: {
          connect: {
            name: roleName
          }
        }
      },
      include: {
        role: true
      }
    });
    console.log('Usuário criado com sucesso:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role?.name ?? 'sem role'
    });
    return user;
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      console.log('Email já está em uso');
      return null;
    }
    if (error instanceof Error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao criar usuário');
  }
}

async function main() {
  try {
    console.log('=== Criação de Usuário ===');
    
    // Criar role se necessário
    console.log('\n=== Configuração da Role ===');
    const roleName = await question('Nome da role (ex: admin, user): ');
    const roleDescription = await question('Descrição da role: ');
    await createRole(roleName, roleDescription);

    // Criar usuário
    console.log('\n=== Dados do Usuário ===');
    const email = await question('Email: ');
    const name = await question('Nome: ');
    const password = await question('Senha: ');

    await createUser(email, name, password, roleName);

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();