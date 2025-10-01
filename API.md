# 📡 Documentação da API - Sistema Financeiro

## 🔐 Autenticação

Todas as rotas requerem autenticação via NextAuth. O usuário deve estar logado para acessar os endpoints.

---

## 🏦 Bank Accounts (Contas Bancárias)

### `GET /api/bank-accounts`
Lista todas as contas bancárias do usuário (incluindo contas compartilhadas).

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "institution": "string",
    "type": "CHECKING | SAVINGS | INVESTMENT | CASH | OTHER",
    "initialBalance": "decimal",
    "currentBalance": "decimal",
    "color": "string",
    "isActive": "boolean",
    "users": [...],
    "_count": {
      "transactions": "number",
      "cards": "number"
    }
  }
]
```

### `POST /api/bank-accounts`
Cria uma nova conta bancária.

**Body:**
```json
{
  "name": "string",
  "institution": "string",
  "type": "CHECKING | SAVINGS | INVESTMENT | CASH | OTHER",
  "initialBalance": "number",
  "color": "string",
  "sharedWithUserIds": ["userId1", "userId2"] // IDs dos usuários para compartilhar
}
```

### `GET /api/bank-accounts/[id]`
Busca uma conta específica com detalhes.

### `PATCH /api/bank-accounts/[id]`
Atualiza uma conta bancária (apenas OWNER).

**Body:**
```json
{
  "name": "string",
  "institution": "string",
  "type": "string",
  "color": "string",
  "isActive": "boolean"
}
```

### `DELETE /api/bank-accounts/[id]`
Deleta uma conta (apenas OWNER). Se houver transações, apenas desativa.

---

## 💳 Cards (Cartões)

### `GET /api/cards`
Lista todos os cartões do usuário.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "lastDigits": "string",
    "type": "CREDIT | DEBIT",
    "brand": "VISA | MASTERCARD | ELO | AMEX | HIPERCARD | OTHER",
    "limit": "decimal",
    "dueDay": "number",
    "closingDay": "number",
    "color": "string",
    "isActive": "boolean",
    "bankAccount": {...}
  }
]
```

### `POST /api/cards`
Cria um novo cartão.

**Body:**
```json
{
  "name": "string",
  "lastDigits": "string", // 4 dígitos
  "type": "CREDIT | DEBIT",
  "brand": "VISA | MASTERCARD | ELO | AMEX | HIPERCARD | OTHER",
  "limit": "number",
  "dueDay": "number",
  "closingDay": "number",
  "color": "string",
  "bankAccountId": "string" // opcional
}
```

### `GET /api/cards/[id]`
Busca um cartão específico.

### `PATCH /api/cards/[id]`
Atualiza um cartão.

### `DELETE /api/cards/[id]`
Deleta um cartão. Se houver transações, apenas desativa.

---

## 🏷️ Categories (Categorias)

### `GET /api/categories`
Lista todas as categorias (padrão + personalizadas do usuário).

**Query Params:**
- `type`: `INCOME` ou `EXPENSE` (opcional)

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "icon": "string",
    "color": "string",
    "type": "INCOME | EXPENSE",
    "isDefault": "boolean",
    "_count": {
      "transactions": "number",
      "budgets": "number"
    }
  }
]
```

### `POST /api/categories`
Cria uma nova categoria personalizada.

**Body:**
```json
{
  "name": "string",
  "icon": "string",
  "color": "string",
  "type": "INCOME | EXPENSE"
}
```

### `GET /api/categories/[id]`
Busca uma categoria específica.

### `PATCH /api/categories/[id]`
Atualiza uma categoria personalizada.

### `DELETE /api/categories/[id]`
Deleta uma categoria personalizada (não pode ter transações).

---

## 💰 Transactions (Transações)

### `GET /api/transactions`
Lista transações do usuário com filtros e paginação.

**Query Params:**
- `type`: `INCOME` ou `EXPENSE`
- `categoryId`: ID da categoria
- `bankAccountId`: ID da conta
- `cardId`: ID do cartão
- `isPaid`: `true` ou `false`
- `startDate`: Data inicial (ISO)
- `endDate`: Data final (ISO)
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 50)

**Response:**
```json
{
  "transactions": [...],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

### `POST /api/transactions`
Cria uma nova transação.

**Body:**
```json
{
  "description": "string",
  "amount": "number",
  "type": "INCOME | EXPENSE",
  "date": "ISO date",
  "categoryId": "string",
  "bankAccountId": "string", // opcional
  "cardId": "string", // opcional
  "isPaid": "boolean",
  "isRecurring": "boolean",
  "recurringType": "DAILY | WEEKLY | MONTHLY | YEARLY", // se recorrente
  "installments": "number", // para parcelamentos
  "notes": "string"
}
```

**Recursos especiais:**
- Se `installments > 1`: cria transação pai + parcelas mensais
- Se `isPaid = true` e `bankAccountId`: atualiza saldo da conta automaticamente

### `GET /api/transactions/[id]`
Busca uma transação específica com detalhes.

### `PATCH /api/transactions/[id]`
Atualiza uma transação.

**Body:**
```json
{
  "description": "string",
  "amount": "number",
  "date": "ISO date",
  "categoryId": "string",
  "bankAccountId": "string",
  "cardId": "string",
  "isPaid": "boolean",
  "notes": "string"
}
```

### `DELETE /api/transactions/[id]`
Deleta uma transação. Se for parcelada (pai), deleta todas as parcelas.

---

## 🎯 Goals (Metas)

### `GET /api/goals`
Lista todas as metas do usuário (individuais e compartilhadas).

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "targetAmount": "decimal",
    "currentAmount": "decimal",
    "deadline": "ISO date",
    "icon": "string",
    "color": "string",
    "isCompleted": "boolean",
    "users": [...],
    "createdBy": {...}
  }
]
```

### `POST /api/goals`
Cria uma nova meta.

**Body:**
```json
{
  "name": "string",
  "description": "string",
  "targetAmount": "number",
  "deadline": "ISO date",
  "icon": "string",
  "color": "string",
  "sharedWithUserIds": ["userId1", "userId2"] // para metas compartilhadas
}
```

### `GET /api/goals/[id]`
Busca uma meta específica.

### `PATCH /api/goals/[id]`
Atualiza uma meta (apenas criador).

### `DELETE /api/goals/[id]`
Deleta uma meta (apenas criador).

### `POST /api/goals/[id]/contribute`
Adiciona uma contribuição à meta.

**Body:**
```json
{
  "amount": "number"
}
```

**Recursos especiais:**
- Atualiza `currentAmount` da meta
- Atualiza `contribution` do usuário
- Marca `isCompleted = true` automaticamente ao atingir o alvo

---

## 📊 Budgets (Orçamentos)

### `GET /api/budgets`
Lista orçamentos do usuário com gastos reais.

**Query Params:**
- `month`: Mês (1-12)
- `year`: Ano

**Response:**
```json
[
  {
    "id": "string",
    "amount": "decimal",
    "month": "number",
    "year": "number",
    "category": {...},
    "spent": "decimal",
    "remaining": "decimal",
    "percentageUsed": "number"
  }
]
```

### `POST /api/budgets`
Cria um novo orçamento.

**Body:**
```json
{
  "categoryId": "string",
  "amount": "number",
  "month": "number", // 1-12
  "year": "number"
}
```

**Nota:** Apenas categorias de EXPENSE podem ter orçamento.

### `GET /api/budgets/[id]`
Busca um orçamento específico com detalhes de gastos.

### `PATCH /api/budgets/[id]`
Atualiza o valor de um orçamento.

### `DELETE /api/budgets/[id]`
Deleta um orçamento.

---

## 📋 Resumo dos Endpoints

| Recurso | GET List | POST Create | GET Detail | PATCH Update | DELETE |
|---------|----------|-------------|------------|--------------|--------|
| Bank Accounts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cards | ✅ | ✅ | ✅ | ✅ | ✅ |
| Categories | ✅ | ✅ | ✅ | ✅ | ✅ |
| Transactions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Goals | ✅ | ✅ | ✅ | ✅ | ✅ |
| Budgets | ✅ | ✅ | ✅ | ✅ | ✅ |

**Total:** 30 endpoints RESTful

---

## 🔒 Regras de Permissão

### Contas Bancárias
- **OWNER**: Pode editar e deletar a conta
- **MEMBER**: Pode visualizar e usar a conta em transações

### Metas
- **Criador**: Pode editar e deletar a meta
- **Participantes**: Podem contribuir e visualizar

### Demais Recursos
- Apenas o proprietário pode editar/deletar seus próprios recursos
- Categorias padrão não podem ser editadas/deletadas

---

## ⚙️ Funcionalidades Especiais

1. **Parcelamentos**: Cria automaticamente transações filhas mensais
2. **Atualização de Saldo**: Atualiza saldo da conta quando transação é paga
3. **Metas Compartilhadas**: Múltiplos usuários podem contribuir
4. **Orçamentos com Tracking**: Calcula automaticamente gastos vs orçamento
5. **Soft Delete**: Desativa recursos ao invés de deletar quando há dependências
6. **Filtros Avançados**: Transações com múltiplos filtros combinados
7. **Paginação**: Sistema de paginação para grandes volumes de dados

