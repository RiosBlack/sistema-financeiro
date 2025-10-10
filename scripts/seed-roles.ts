import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding roles...');

  // Verificar se as roles já existem
  const existingRoles = await prisma.role.findMany();
  
  if (existingRoles.length > 0) {
    console.log('✅ Roles já existem no banco de dados:');
    existingRoles.forEach(role => {
      console.log(`   - ${role.name}: ${role.description}`);
    });
    return;
  }

  // Criar roles padrão
  const roles = [
    {
      name: 'Admin',
      description: 'Administrador do sistema com acesso total',
    },
    {
      name: 'User',
      description: 'Usuário padrão do sistema',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`✅ Role criada: ${role.name}`);
  }

  console.log('✨ Seeding concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao fazer seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

