const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Categorias padrão de DESPESAS
  const expenseCategories = [
    { name: 'Alimentação', icon: '🍔', color: '#FF6B6B', type: 'EXPENSE' as const },
    { name: 'Transporte', icon: '🚗', color: '#4ECDC4', type: 'EXPENSE' as const },
    { name: 'Moradia', icon: '🏠', color: '#45B7D1', type: 'EXPENSE' as const },
    { name: 'Contas', icon: '📄', color: '#FFA07A', type: 'EXPENSE' as const },
    { name: 'Saúde', icon: '⚕️', color: '#98D8C8', type: 'EXPENSE' as const },
    { name: 'Educação', icon: '📚', color: '#6C5CE7', type: 'EXPENSE' as const },
    { name: 'Lazer', icon: '🎮', color: '#A29BFE', type: 'EXPENSE' as const },
    { name: 'Vestuário', icon: '👕', color: '#FD79A8', type: 'EXPENSE' as const },
    { name: 'Beleza', icon: '💄', color: '#FDCB6E', type: 'EXPENSE' as const },
    { name: 'Pets', icon: '🐾', color: '#E17055', type: 'EXPENSE' as const },
    { name: 'Mercado', icon: '🛒', color: '#00B894', type: 'EXPENSE' as const },
    { name: 'Restaurante', icon: '🍽️', color: '#FF7675', type: 'EXPENSE' as const },
    { name: 'Internet', icon: '🌐', color: '#74B9FF', type: 'EXPENSE' as const },
    { name: 'Telefone', icon: '📱', color: '#A29BFE', type: 'EXPENSE' as const },
    { name: 'Streaming', icon: '📺', color: '#FD79A8', type: 'EXPENSE' as const },
    { name: 'Academia', icon: '💪', color: '#FDCB6E', type: 'EXPENSE' as const },
    { name: 'Presentes', icon: '🎁', color: '#FF6B9D', type: 'EXPENSE' as const },
    { name: 'Impostos', icon: '🏛️', color: '#636E72', type: 'EXPENSE' as const },
    { name: 'Seguros', icon: '🛡️', color: '#2D3436', type: 'EXPENSE' as const },
    { name: 'Investimentos', icon: '📈', color: '#00B894', type: 'EXPENSE' as const },
    { name: 'Viagens', icon: '✈️', color: '#0984E3', type: 'EXPENSE' as const },
    { name: 'Outros', icon: '📦', color: '#B2BEC3', type: 'EXPENSE' as const },
  ];

  // Categorias padrão de RECEITAS
  const incomeCategories = [
    { name: 'Salário', icon: '💰', color: '#00B894', type: 'INCOME' as const },
    { name: 'Freelance', icon: '💼', color: '#6C5CE7', type: 'INCOME' as const },
    { name: 'Investimentos', icon: '📈', color: '#0984E3', type: 'INCOME' as const },
    { name: 'Vendas', icon: '🛍️', color: '#FDCB6E', type: 'INCOME' as const },
    { name: 'Aluguel', icon: '🏘️', color: '#45B7D1', type: 'INCOME' as const },
    { name: 'Prêmios', icon: '🏆', color: '#FD79A8', type: 'INCOME' as const },
    { name: 'Bônus', icon: '💵', color: '#00B894', type: 'INCOME' as const },
    { name: 'Restituição', icon: '🔄', color: '#74B9FF', type: 'INCOME' as const },
    { name: 'Outros', icon: '💸', color: '#55EFC4', type: 'INCOME' as const },
  ];

  // Criar categorias de despesas
  console.log('📝 Criando categorias de despesas...');
  for (const category of expenseCategories) {
    const existing = await prisma.category.findFirst({
      where: { 
        name: category.name,
        type: category.type,
      },
    });
    
    if (!existing) {
      await prisma.category.create({
        data: {
          ...category,
          isDefault: true,
        },
      });
    }
  }

  // Criar categorias de receitas
  console.log('📝 Criando categorias de receitas...');
  for (const category of incomeCategories) {
    const existing = await prisma.category.findFirst({
      where: { 
        name: category.name,
        type: category.type,
      },
    });
    
    if (!existing) {
      await prisma.category.create({
        data: {
          ...category,
          isDefault: true,
        },
      });
    }
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log(`   📊 ${expenseCategories.length} categorias de despesas criadas`);
  console.log(`   📊 ${incomeCategories.length} categorias de receitas criadas`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

