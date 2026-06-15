# 🏢 Reserva Ai!

## 🚀 Status do Sistema

- **Develop (Laboratório)**  
  [![CI](https://github.com/lucasgfaj/reserva-ai/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/lucasgfaj/reserva-ai/actions/workflows/ci.yml)

- **Main (Produção)**  
  [![CI](https://github.com/lucasgfaj/reserva-ai/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/lucasgfaj/reserva-ai/actions/workflows/ci.yml)
  [![Deploy](https://github.com/lucasgfaj/reserva-ai/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/lucasgfaj/reserva-ai/actions/workflows/deploy.yml)

🔗 **Link em Produção:** [Reserva-Ai](https://reserva-ai-eta.vercel.app/)
👨‍💻 **Autores:** [Lucas Fajardo]

## 🎯 1. Visão Geral

O Reserva Ai! é um sistema web para gestão e agendamento de áreas comuns em condomínios (churrasqueiras, salões de festas, quadras). O sistema visa acabar com os conflitos de agenda e a desorganização, permitindo que moradores verifiquem a disponibilidade e reservem espaços de forma autônoma, enquanto o síndico gerencia as áreas e acompanha as reservas com segurança e regras de negócio validadas.

## 📚 2. Documentação Oficial (Docs as Code)

Toda a especificação do sistema está versionada na pasta `/docs`:

- 📄 **[PRD (Product Requirements Document)](./docs/prd.md):** Visão do produto, Personas, User Stories e Divisão de Épicos.
- 📐 **[SDD (Software Design Document)](./docs/sdd.md):** Diagrama de banco de dados (Mermaid), contratos de API, DTOs e Fluxo de Autenticação.
- ✅ **[Checklist de Avaliação](./docs/checklist.md):** Controle de entrega dos IDs e RAs da disciplina de Tópicos Especiais.

## 🛠 3. Stack Tecnológica

- **Arquitetura:** Monorepo (Back, Front no mesmo repositório).
- **Backend (API):** NestJS, TypeScript, JWT.
- **Banco de Dados:** PostgreSQL gerenciado via Prisma ORM.
- **Frontend (Web):** Vue.js + TailwindCSS.
- **Integração:** Consumo de API Externa (Brasil API para feriados nacionais).

## 🚀 4. Quick Start (Como Executar)

### Pré-requisitos

- **Node.js** 20+
- **PostgreSQL** (local com Docker ou Neon/Supabase na nuvem)
- **Docker** (opcional, para PostgreSQL local)

### 4.1. Clone e instale dependências

```bash
git clone https://github.com/lucasgfaj/reserva-ai.git
cd reserva-ai
npm install
```

### 4.2. Configure o Banco de Dados

**Opção A — PostgreSQL local com Docker (recomendado):**

```bash
docker run --name reserva-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=reserva_ai_db -p 5432:5432 -d postgres:16-alpine
```

**Opção B — PostgreSQL na nuvem (Neon, Supabase, Railway):**

Crie um banco gratuito em [neon.tech](https://neon.tech) ou [supabase.com](https://supabase.com) e copie a `DATABASE_URL`.

### 4.3. Variáveis de Ambiente

```bash
cp apps/api/.env.example apps/api/.env
```

Edite `apps/api/.env` se necessário. O padrão já funciona com o Docker local.

### 4.4. Rodar migrations + seed

```bash
npm run dev:prisma:seed
```

Esse comando gera o Prisma Client, aplica as migrations e popula o banco com dados de demonstração.

### 4.5. Iniciar a aplicação

Abra **dois terminais**:

```bash
# Terminal 1 - Backend (porta 3000)
npm run dev:api

# Terminal 2 - Frontend (porta 5173)
npm run dev:web
```

Acesse: http://localhost:5173
Documentação Swagger: http://localhost:3000/api/v1/docs
Prisma Studio (opcional): `npm run dev:prisma:studio`

## 🔐 Credenciais de Teste (Seed)

Após rodar o seed, use estas credenciais para testar:

| Papel   | E-mail              | Senha         |
|---------|---------------------|---------------|
| Admin   | admin@reservai.com  | Admin@123     |
| Morador | morador@reservai.com| Resident@123  |

### O que o seed cria

- **Condomínio:** Condomínio Vila Verde
- **Bloco/Unidade:** Bloco A, Ap 101
- **Admin:** admin@reservai.com (ADMIN)
- **Morador:** morador@reservai.com (RESIDENT)
- **8 áreas comuns:** Salão de Festas, Churrasqueira, Piscina, Quadra Poliesportiva, Academia, Espaço Gourmet, Brinquedoteca, Salão de Jogos
  - Salão de Festas e Espaço Gourmet exigem aprovação (`requiresApproval: true`)
  - Churrasqueira funciona apenas sábados e domingos

### Recriar dados do zero

```bash
npm run dev:prisma:seed
```

## 🧪 Testes

```bash
# Backend (unitários)
npm run dev:api:test

# Backend (E2E)
npm run dev:api:test:e2e

# Backend (com cobertura)
npm run dev:api:test:cover

# Frontend
npm run dev:web:test
```

## 🎨 5. Prototipação (Stitch)

Reserva-Ai Prototype no **Stitch**.

- [Projeto Reserva Ai! no Stitch](https://stitch.withgoogle.com/projects/13048352404537770910)


