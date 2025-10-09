<!-- 83d16ba0-71cc-4992-adcf-597ef7486100 7f3805e1-9ee7-4bf3-aceb-ef4cc098bc48 -->
# Sistema de Família Compartilhada

## Visão Geral

Implementar funcionalidade para usuários adicionarem membros da família e compartilharem dados financeiros (contas, transações, cartões, metas, categorias) com controle de permissões.

## Arquitetura de Dados

### 1. Novos Modelos Prisma (prisma/schema.prisma)

**Family** - Representa um grupo familiar

```prisma
model Family {
  id          String   @id @default(cuid())
  name        String
  createdById String
  createdBy   User     @relation("FamilyCreator", fields: [createdById], references: [id])
  members     FamilyMember[]
  invitations FamilyInvitation[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**FamilyMember** - Membros da família

```prisma
model FamilyMember {
  id       String @id @default(cuid())
  familyId String
  userId   String
  role     FamilyRole @default(MEMBER) // OWNER ou MEMBER
  family   Family @relation(fields: [familyId], references: [id], onDelete: Cascade)
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  joinedAt DateTime @default(now())
  @@unique([familyId, userId])
}

enum FamilyRole {
  OWNER   // Criador, pode remover membros
  MEMBER  // Apenas visualização
}
```

**FamilyInvitation** - Convites pendentes

```prisma
model FamilyInvitation {
  id         String @id @default(cuid())
  familyId   String
  invitedId  String // ID do usuário convidado
  invitedBy  String // ID de quem convidou
  status     InvitationStatus @default(PENDING)
  family     Family @relation(fields: [familyId], references: [id], onDelete: Cascade)
  invited    User   @relation("InvitationsReceived", fields: [invitedId], references: [id])
  inviter    User   @relation("InvitationsSent", fields: [invitedBy], references: [id])
  createdAt  DateTime @default(now())
  respondedAt DateTime?
  @@unique([familyId, invitedId])
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

**Adicionar campos de compartilhamento aos modelos existentes:**

- `BankAccount`: adicionar campo `isShared Boolean @default(false)`
- `Card`: adicionar campo `isShared Boolean @default(false)`
- `Category`: adicionar campo `isShared Boolean @default(false)`
- `Transaction`: adicionar campo `isShared Boolean @default(false)`
- `Goal`: já tem suporte via `UserGoal`

### 2. API Routes

**Família** (`app/api/family/route.ts`):

- `GET` - Buscar família do usuário atual
- `POST` - Criar nova família

**Membros** (`app/api/family/members/route.ts`):

- `GET` - Listar membros da família
- `DELETE` - Remover membro (apenas OWNER)

**Convites** (`app/api/family/invitations/route.ts`):

- `GET` - Listar convites pendentes do usuário
- `POST` - Enviar convite para outro usuário (busca por email)

**Ações de Convite** (`app/api/family/invitations/[id]/route.ts`):

- `PATCH` - Aceitar/rejeitar convite

**Compartilhamento** (`app/api/family/share/route.ts`):

- `POST` - Compartilhar/descompartilhar item específico (conta, cartão, categoria, transação)

### 3. Modificações nas APIs Existentes

Atualizar queries para incluir dados compartilhados:

**Contas** (`app/api/bank-accounts/route.ts`):

```typescript
// Buscar contas próprias + contas compartilhadas por membros da família
const accounts = await prisma.bankAccount.findMany({
  where: {
    OR: [
      { createdById: userId }, // Minhas contas
      { 
        isShared: true,
        createdBy: {
          familyMembers: {
            some: {
              family: {
                members: {
                  some: { userId }
                }
              }
            }
          }
        }
      } // Contas compartilhadas por família
    ]
  }
})
```

Aplicar lógica similar para:

- Cartões (`app/api/cards/route.ts`)
- Transações (`app/api/transactions/route.ts`)
- Categorias (`app/api/categories/route.ts`)
- Metas (já funciona via `UserGoal`)

### 4. Store Zustand

**Family Store** (`store/use-family-store.ts`):

```typescript
interface FamilyStore {
  family: Family | null
  members: FamilyMember[]
  invitations: FamilyInvitation[]
  pendingInvitationsCount: number
  fetchFamily: () => Promise<void>
  createFamily: (name: string) => Promise<void>
  inviteMember: (email: string) => Promise<void>
  acceptInvitation: (id: string) => Promise<void>
  rejectInvitation: (id: string) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  toggleShare: (type: string, itemId: string, shared: boolean) => Promise<void>
}
```

### 5. Componentes UI

**Página de Família** (`app/dashboard/family/page.tsx`):

- Card com informações da família
- Lista de membros
- Botão para convidar novo membro
- Botão para sair da família (se MEMBER)

**Dialog de Convite** (`components/family/invite-member-dialog.tsx`):

- Input para buscar usuário por email
- Botão para enviar convite

**Notificações de Convite** (`components/family/invitation-notifications.tsx`):

- Badge no header com contador
- Dropdown com convites pendentes
- Botões aceitar/rejeitar

**Toggle de Compartilhamento**:

- Adicionar switch em formulários de conta, cartão, categoria, transação
- Mostrar ícone de "compartilhado" em listagens

### 6. Modificações em Componentes Existentes

**Header** (`components/header.tsx`):

- Adicionar badge de notificações de convite
- Dropdown para aceitar/rejeitar convites

**Sidebar** (`components/app-sidebar.tsx`):

- Adicionar item "Família" no menu

**Formulários**:

- `AccountForm`: adicionar toggle "Compartilhar com família"
- `CardForm`: adicionar toggle "Compartilhar com família"
- `CategoryForm`: adicionar toggle "Compartilhar com família"
- `TransactionForm`: adicionar toggle "Compartilhar com família"

**Listagens**:

- Adicionar indicador visual (ícone/badge) para itens compartilhados
- Mostrar "Criado por [nome]" em itens de outros membros
- Desabilitar edição/exclusão para itens de outros membros

### 7. Regras de Permissão

**OWNER (Criador da família)**:

- Visualizar todos os dados compartilhados
- Remover membros
- Não pode editar/excluir dados de outros membros

**MEMBER**:

- Visualizar todos os dados compartilhados
- Não pode editar/excluir dados de outros membros
- Pode sair da família

**Dados Próprios**:

- Sempre pode editar/excluir seus próprios dados
- Pode compartilhar/descompartilhar a qualquer momento

### 8. Validações e Regras de Negócio

- Usuário só pode estar em uma família por vez
- Não pode convidar usuário que já está em outra família
- Não pode convidar a si mesmo
- Convite expira após 30 dias
- Ao sair da família, dados compartilhados ficam ocultos
- Ao excluir família (OWNER), todos os membros são removidos
- Transações vinculadas a contas compartilhadas ficam visíveis mesmo se a transação não for compartilhada

## Ordem de Implementação

1. Criar migração Prisma com novos modelos
2. Implementar APIs de família e convites
3. Criar store Zustand
4. Modificar queries das APIs existentes
5. Criar componentes de UI (página família, dialogs, notificações)
6. Adicionar toggles de compartilhamento nos formulários
7. Atualizar listagens com indicadores visuais
8. Implementar regras de permissão no frontend
9. Testes e ajustes finais

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