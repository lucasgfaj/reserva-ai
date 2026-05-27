# 🏢 Reserva Ai!

## 🚀 Status do Sistema

- **Develop (Laboratório)**  
  [![CI](https://github.com/lucasgfaj/reserva-ai/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/lucasgfaj/reserva-ai/actions/workflows/ci.yml)

- **Main (Produção)**  
  [![CI](https://github.com/lucasgfaj/reserva-ai/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/lucasgfaj/reserva-ai/actions/workflows/ci.yml)

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

- **Arquitetura:** Monorepo (Back, Front e Extensão no mesmo repositório).
- **Backend (API):** NestJS, TypeScript, JWT, Google OAuth.
- **Banco de Dados:** PostgreSQL (Nuvem) gerenciado via Prisma ORM.
- **Frontend (Web):** Vue.js + TailwindCSS.
- **Integração:** Consumo de API Externa (Brasil API para feriados nacionais).

## 🚀 4. Quick Start (Como Executar)

**1. Clone o repositório:**

    git clone https://github.com/lucasgfaj/reserva-ai.git
    cd reserva-ai

**2. Configuração Inicial e Variáveis de Ambiente:**
Não esqueça de copiar o arquivo `.env.example` para `.env` dentro da pasta `apps/api` e configurar a `DATABASE_URL` do seu PostgreSQL. Em seguida, instale as dependências executando na raiz:

    npm install

**3. Banco de Dados:**
Para gerar o Prisma Client e atualizar o banco de dados:

    npm run dev:prisma

**4. Iniciar a Aplicação:**
A partir da raiz do monorepo, inicie os serviços (abra terminais separados):

    # Terminal 1 - Iniciar a API NestJS
    npm run dev:api

    # Terminal 2 - Iniciar o Frontend
    npm run dev:web

    # Terminal 3 - Prisma Studio (Visão do Banco - Opcional)
    npm run dev:prisma:studio

## 🎨 5. Prototipação (Stitch)

Reserva-Ai Prototype no **Stitch**.

- [Projeto Reserva Ai! no Stitch](https://stitch.withgoogle.com/projects/13048352404537770910)


