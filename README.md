# 🏢 Reserva Ai!

**Status do Sistema:**
[![CI - Develop (Laboratório)](https://github.com/lucasgfaj/reserva-ai/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/lucasgfaj/reserva-ai/actions/workflows/ci.yml)    
[![CI - Main (Produção)](https://github.com/lucasgfaj/reserva-ai/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/lucasgfaj/reserva-ai/actions/workflows/ci.yml)


🔗 **Link em Produção:** [Aguardando Deploy na Nuvem]
👨‍💻 **Autores:** [Lucas Fajardo]

## 🎯 1. Visão Geral
O Reserva Ai! é um sistema web para gestão e agendamento de áreas comuns em condomínios (churrasqueiras, salões de festas, quadras). O sistema visa acabar com os conflitos de agenda e a desorganização, permitindo que moradores verifiquem a disponibilidade e reservem espaços de forma autônoma, enquanto o síndico gerencia as áreas e acompanha as reservas com segurança e regras de negócio validadas.

## 📚 2. Documentação Oficial (Docs as Code)
Toda a especificação do sistema está versionada na pasta `/docs`:
* 📄 **[PRD (Product Requirements Document)](./docs/prd.md):** Visão do produto, Personas, User Stories e Divisão de Épicos.
* 📐 **[SDD (Software Design Document)](./docs/sdd.md):** Diagrama de banco de dados (Mermaid), contratos de API, DTOs e Fluxo de Autenticação.
* ✅ **[Checklist de Avaliação](./docs/checklist.md):** Controle de entrega dos IDs e RAs da disciplina de Tópicos Especiais.

## 🛠 3. Stack Tecnológica
* **Arquitetura:** Monorepo (Back, Front e Extensão no mesmo repositório).
* **Backend (API):** NestJS, TypeScript, JWT, Google OAuth.
* **Banco de Dados:** PostgreSQL (Nuvem) gerenciado via Prisma ORM.
* **Frontend (Web):** React.js (ou Vue.js) + TailwindCSS.
* **Integração:** Consumo de API Externa (Brasil API para feriados nacionais).

## 🚀 4. Quick Start (Como Executar)

**1. Clone o repositório:**

    git clone https://github.com/lucasgfaj/reserva-ai.git
    cd reserva-ai

**2. Instale as dependências:**
Como é um Monorepo, você precisa instalar os pacotes em cada camada:

    # Terminal 1 - Iniciar a API NestJS
    cd apps/api
    npm installc
    npm run start:dev

    # Terminal 2 - Iniciar o Frontend Angular
    cd apps/web
    npm install
    npm run dev

    # Terminal 3 - Compilar a Extensão
    cd apps/extension
    npm install
    npm run build

**3. Variáveis de Ambiente:**
Não esqueça de copiar o arquivo `.env.example` para `.env` dentro da pasta `apps/api` e configurar a `DATABASE_URL` do seu PostgreSQL.
