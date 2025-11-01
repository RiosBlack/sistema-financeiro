<!-- 83d16ba0-71cc-4992-adcf-597ef7486100 7f3805e1-9ee7-4bf3-aceb-ef4cc098bc48 -->
# Refatoração do Sistema de Compartilhamento Familiar

## Mudanças Principais

### 1. Simplificar Compartilhamento Automático

**Remover sistema de toggle manual:**

- Remover card "Gerenciar Compartilhamentos" de `app/dashboard/family/page.tsx`
- Remover imports de stores (useTransactionsStore, useGoalsStore, useBankAccountsStore, useCardsStore)
- Remover função `handleToggleShare`
- Remover método `toggleShare` de `store/use-family-store.ts`

**Atualizar API de compartilhamento:**

- Deletar `app/api/family/share/route.ts` (não será mais necessário)
- Modificar lógica nas APIs existentes para compartilhar automaticamente baseado na família:
- `app/api/bank-accounts/route.ts`: Ao criar conta, se usuário tem família, definir `isShared: true` automaticamente
- `app/api/cards/route.ts`: Ao criar cartão, se usuário tem família, definir `isShared: true` automaticamente
- `app/api/transactions/route.ts`: Ao criar transação, se usuário tem família, definir `isShared: true` automaticamente
- `app/api/goals/route.ts`: Ao criar meta, se usuário tem família, definir `isShared: true` automaticamente

### 2. Criar Nova Página de Visualização de Membros

**Rota: `/dashboard/family/shared`**

Criar arquivo `app/dashboard/family/shared/page.tsx`:

- Listar todos os membros da família em cards clicáveis
- Cada card mostra: foto, nome, email, badge (OWNER/MEMBER)
- Ao clicar em um membro, abre uma view modal ou navega para `/dashboard/family/shared/[userId]`

**Rota dinâmica: `/dashboard/family/shared/[userId]/page.tsx`**

Criar dashboard completo read-only com dados do membro selecionado:

- Header mostrando nome do membro e botão "Voltar"
- Reutilizar componentes do dashboard principal mas em modo visualização
- Seções:
- Cards de métricas (Saldo Total, Receitas, Despesas, Metas)
- Gráfico de Overview (receitas vs despesas)
- Gráfico de Despesas por Categoria
- Gráfico de Progresso de Metas
- Lista de Transações Recentes (últimas 10)
- Lista de Contas Bancárias
- Lista de Cartões
- Lista de Metas

### 3. Criar Nova API para Buscar Dados de Membros

**Arquivo: `app/api/family/members/[userId]/data/route.ts`**

Endpoint GET que retorna todos os dados financeiros de um membro específico:

- Verificar se o usuário autenticado está na mesma família que o userId solicitado
- Retornar 403 se não estiver na mesma família
- Buscar e retornar:
- Contas bancárias (com saldo)
- Cartões
- Transações (com filtros de data opcionais via query params)
- Metas
- Categorias personalizadas
- Todas as queries devem filtrar por `userId` do membro e `isShared: true`

### 4. Criar Store para Dados de Visualização

**Arquivo: `store/use-member-view-store.ts`**

Store Zustand para gerenciar dados do membro sendo visualizado:

- Estado: `memberData` (contas, cartões, transações, metas, categorias)
- Estado: `selectedMemberId`
- Estado: `isLoading`
- Ação: `fetchMemberData(userId: string)` - chama API `/api/family/members/[userId]/data`
- Ação: `clearMemberData()` - limpa dados ao sair da visualização

### 5. Atualizar Página Principal da Família

**Arquivo: `app/dashboard/family/page.tsx`**

Adicionar botão "Visualizar Dados Compartilhados":

- Posicionar ao lado de "Convidar Membro" no header
- Redireciona para `/dashboard/family/shared`
- Ícone: Eye ou Share2

Remover todo o card de gerenciamento de compartilhamento (tabs com Contas, Cartões, Transações, Metas).

### 6. Atualizar Schema do Prisma (se necessário)

Verificar se campos `isShared` já existem em:

- BankAccount
- Card
- Transaction
- Goal
- Category

Se não existirem, adicionar e criar migração.

### 7. Componentes Reutilizáveis

Criar componente wrapper para modo visualização:
**Arquivo: `components/member-dashboard-view.tsx`**

Recebe `userId` como prop e renderiza dashboard completo usando dados do store `use-member-view-store`.

## Arquivos a Modificar

1. `app/dashboard/family/page.tsx` - Simplificar, remover tabs de compartilhamento
2. `store/use-family-store.ts` - Remover toggleShare
3. `app/api/bank-accounts/route.ts` - Auto-compartilhar ao criar
4. `app/api/cards/route.ts` - Auto-compartilhar ao criar
5. `app/api/transactions/route.ts` - Auto-compartilhar ao criar
6. `app/api/goals/route.ts` - Auto-compartilhar ao criar

## Arquivos a Criar

1. `app/dashboard/family/shared/page.tsx` - Lista de membros
2. `app/dashboard/family/shared/[userId]/page.tsx` - Dashboard do membro
3. `app/api/family/members/[userId]/data/route.ts` - API para buscar dados
4. `store/use-member-view-store.ts` - Store para visualização
5. `components/member-dashboard-view.tsx` - Componente reutilizável

## Arquivos a Deletar

1. `app/api/family/share/route.ts` - Não mais necessário

### To-dos

- [ ] Criar modelos Family, FamilyMember, FamilyInvitation e adicionar campos isShared aos modelos existentes
- [ ] Executar migração do Prisma para criar novas tabelas
- [ ] Implementar APIs de família (criar, buscar, membros)
- [ ] Implementar APIs de convites (enviar, listar, aceitar, rejeitar)
- [ ] Implementar API de compartilhamento de itens
- [ ] Modificar APIs existentes (contas, cartões, transações, categorias) para incluir dados compartilhados
- [ ] Criar store Zustand para gerenciamento de família
- [ ] Criar página de família com listagem de membros e convites
- [ ] Criar componentes de notificação e gerenciamento de convites
- [ ] Adicionar toggles de compartilhamento em todos os formulários
- [ ] Adicionar indicadores visuais de compartilhamento nas listagens
- [ ] Implementar regras de permissão (desabilitar edição/exclusão de itens de outros)
- [ ] Adicionar item Família no sidebar e badge de notificações no header