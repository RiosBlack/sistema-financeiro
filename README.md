# 💰 Financial System

Um sistema de gestão financeira pessoal e familiar desenvolvido com Next.js, TypeScript e Prisma.

## 📋 Sobre o Projeto

Este projeto foi criado com a **intenção de uso próprio** para gerenciar finanças pessoais e familiares. É um sistema completo que permite controlar receitas, despesas, contas bancárias, cartões, metas financeiras e categorias.

## 🌟 Características

- **🔐 Autenticação** completa com NextAuth.js
- **💳 Gestão de Contas** bancárias individuais e conjuntas
- **💳 Cartões** de crédito e débito
- **📊 Transações** com suporte a parcelamentos e recorrência
- **🎯 Metas Financeiras** individuais e compartilhadas
- **📂 Categorias** personalizáveis com ícones e cores
- **📈 Dashboard** com gráficos e relatórios
- **💰 Saldo Futuro** com projeções financeiras
- **🔍 Busca** avançada de transações
- **📱 Interface Responsiva** para desktop e mobile

## 🛠️ Tecnologias Utilizadas

### Frontend

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Zustand** - Gerenciamento de estado
- **Recharts** - Gráficos e visualizações

### Backend

- **Next.js API Routes** - API RESTful
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **NextAuth.js** - Autenticação

### DevOps

- **Docker** - Containerização do banco
- **pnpm** - Gerenciador de pacotes

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- pnpm
- Docker (para PostgreSQL)

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd financial-system
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/financial_system"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**⚠️ IMPORTANTE:** Gere uma chave secreta segura para `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

Você também pode copiar o arquivo de exemplo:
```bash
cp env.example .env
# Depois edite o .env com suas configurações
```

### 4. Configure o banco de dados

```bash
# Inicie o PostgreSQL com Docker
docker-compose up -d

# Execute as migrações
pnpm prisma migrate dev

# Gere o cliente Prisma
pnpm prisma generate

# Popule o banco com dados iniciais
pnpm prisma db seed
```

### 5. Execute o projeto

```bash
pnpm dev
```

O sistema estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
financial-system/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   ├── dashboard/         # Páginas do dashboard
│   └── (auth)/           # Páginas de autenticação
├── components/            # Componentes React
│   ├── forms/            # Formulários
│   ├── charts/           # Gráficos
│   └── ui/               # Componentes UI
├── hooks/                # Custom hooks
├── lib/                  # Utilitários e configurações
├── prisma/               # Schema e migrações
├── store/                # Zustand stores
├── types/                # Definições TypeScript
└── public/               # Arquivos estáticos
```

## 🎯 Funcionalidades Principais

### 💰 Gestão Financeira

- **Receitas e Despesas** com categorização
- **Parcelamentos** automáticos
- **Transações Recorrentes** (mensal, semanal, etc.)
- **Status de Pagamento** (pago/pendente)

### 🏦 Contas e Cartões

- **Contas Bancárias** individuais e conjuntas
- **Cartões de Crédito** e débito
- **Controle de Limites** e saldos

### 🎯 Metas Financeiras

- **Metas Individuais** e compartilhadas
- **Acompanhamento de Progresso**
- **Contribuições** para metas

### 📊 Relatórios e Dashboard

- **Visão Geral** financeira
- **Gráficos** de receitas vs despesas
- **Análise por Categoria**
- **Projeção de Saldo Futuro**

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar em produção
pnpm start

# Linting
pnpm lint

# Prisma
pnpm prisma studio    # Interface visual do banco
pnpm prisma generate  # Gerar cliente
pnpm prisma migrate   # Executar migrações
pnpm prisma db seed   # Popular banco
```

## 🔍 Troubleshooting

### Erro: `CLIENT_FETCH_ERROR` - "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"

**Causa:** Falta a variável `NEXTAUTH_SECRET` no arquivo `.env` ou o middleware está bloqueando as rotas de autenticação.

**Solução:**
1. Certifique-se de que o arquivo `.env` existe na raiz do projeto
2. Gere uma chave secreta:
   ```bash
   openssl rand -base64 32
   ```
3. Adicione ao `.env`:
   ```env
   NEXTAUTH_SECRET="sua-chave-gerada-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. Reinicie o servidor de desenvolvimento

### Erro: Banco de dados não conecta

**Solução:**
```bash
# Verificar se o container está rodando
docker ps

# Iniciar o container
docker-compose up -d

# Verificar logs
docker-compose logs postgres
```

### Erro: Prisma Client não encontrado

**Solução:**
```bash
pnpm prisma generate
pnpm install
```

## 📝 Licença

Este projeto é **open source** e está disponível sob a licença MIT. Foi criado com a intenção de uso próprio, mas pode ser utilizado e modificado por outros desenvolvedores.

## 🤝 Contribuições

Contribuições são bem-vindas! Este projeto foi desenvolvido para uso pessoal, mas melhorias e correções são sempre apreciadas.

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Este é um projeto pessoal desenvolvido para uso próprio. Se você encontrar bugs ou tiver sugestões, sinta-se à vontade para abrir uma issue.

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://prisma.io/) - ORM
- [Shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Recharts](https://recharts.org/) - Biblioteca de gráficos

---

**Desenvolvido com ❤️ para uso pessoal e familiar**

