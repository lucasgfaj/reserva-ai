# 📄 Product Requirements Document (PRD) - Reserva Aí!

**Projeto:** Reserva Aí! (Gestão de Condomínios e Áreas Comuns)
**Versão:** 1.0.0
**Status:** 🟢 Definido (MVP Acadêmico)

---

## 🎯 1. Visão Geral e Objetivo

O gerenciamento manual de reservas de áreas comuns em condomínios é propenso a conflitos, falta de transparência e baixa rastreabilidade. O **Reserva Aí!** visa digitalizar e automatizar esse processo, permitindo que moradores realizem reservas de forma segura, enquanto administradores mantêm controle total sobre o uso das áreas.

O objetivo é fornecer uma plataforma web moderna, com autenticação segura, controle de acesso por papéis e validação rigorosa de dados, garantindo organização, confiabilidade e escalabilidade.

---

## 📖 2. Glossário Ubíquo

* **Reserva:** Agendamento de uso de uma área comum em um intervalo de tempo, que possui um ciclo de vida baseado em status (ex: Confirmada, Cancelada).
* **Área Comum:** Espaços compartilhados como salão de festas, churrasqueira, piscina. Possuem atributos operacionais restritivos (capacidade máxima, horário de abertura e fechamento).
* **Condomínio:** Entidade (Tenant) que agrupa usuários e áreas, garantindo isolamento de dados.
* **Usuário:** Conta de acesso ao sistema com papéis definidos (Morador, Admin Local, ou Super Admin).
* **Admin Local (Síndico):** Usuário com permissões elevadas de gestão no escopo restrito de um condomínio.

---

## 👤 3. Atores e Permissões

* **Administrador (Admin Local/Síndico):** Gestor do Condomínio. Na página inicial do MVP, é ele quem cria o Condomínio e se torna o administrador raiz daquele Tenant. Gerencia estritamente o seu próprio condomínio, áreas e cadastra moradores (ou outros admins locais).
* **Morador (User):** Vinculado a um único condomínio. Não se cadastra ativamente pela página inicial; sua conta é criada por um Administrador. Realiza reservas e consulta disponibilidade.
* **Super Admin (Out of Scope MVP):** Proprietário da plataforma SaaS. Existe o papel no Banco de Dados para gerência global da infraestrutura (possuindo vínculo nulo com condomínios), mas não possuirá telas ou fluxos de interface nesta etapa do MVP para evitar fuga de escopo.
* **Sistema:** Valida regras de negócio, autenticação e conflitos de horários.

---

## 📝 4. Escopo Funcional (User Stories)

| ID | Ator | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **US01** | Administrador | Criar uma conta e registrar seu Condomínio de forma unificada na landing page (Self-Service Onboarding). | 🔥 Crítica |
| **US02** | Administrador | Fazer login e gerenciar os dados do seu próprio condomínio. | 🔥 Alta |
| **US03** | Administrador | Cadastrar as credenciais dos moradores de forma restrita (o morador não possui tela de registro livre). | 🔥 Alta |
| **US03.1**| Morador | Realizar login com as credenciais fornecidas/geradas pelo Administrador do seu condomínio. | 🔥 Crítica |
| **US04** | Administrador | Cadastrar e gerenciar áreas comuns disponíveis para reserva. | 🔥 Crítica |
| **US05** | Usuário | Visualizar as áreas comuns disponíveis no condomínio. | 🔥 Alta |
| **US06** | Usuário | Consultar a disponibilidade de uma área comum em data e horário desejados. | 🔥 Crítica |
| **US07** | Usuário | Realizar uma reserva de área comum em um período disponível, respeitando o horário de funcionamento. | 🔥 Crítica |
| **US08** | Usuário/Admin | Cancelar uma reserva (alteração de status para CANCELADO, retendo rastreabilidade do autor). | ⚡ Média |
| **US09** | Usuário | Consultar o histórico das próprias reservas. | ⚡ Média |
| **US10** | Administrador | Visualizar todas as reservas realizadas no condomínio. | 🔥 Alta |
| **US11** | Administrador | Acompanhar histórico de status de reservas e cancelamentos das áreas comuns. | ⚡ Média |
| **US12** | Sistema | Impedir reservas em horários conflitantes para a mesma área comum. | 🔥 Crítica |

## 🛡️ 5. Regras de Negócio

* RN01: O escopo de dados é estritamente isolado por condomínio (Tenant). Exceção para o perfil `Super Admin` onde o vínculo é nulo para atuação global.
* RN01.1: Moradores não possuem fluxo público de cadastro; eles dependem exclusivamente do cadastro restrito feito por um Administrador.
* RN01.2: O perfil `Super Admin` enxerga toda a base de dados, porém não terá interface gráfica no MVP.
* RN02: A criação de um condomínio requer, simultaneamente, a criação da conta do seu Administrador raiz (Self-Service).
* RN03: Não pode haver conflito de horário na mesma área (Regra de exclusividade de horário, independente do número de convidados para aquela reserva).
* RN03.1: Cada Área Comum possui configurações próprias de capacidade máxima e horário de funcionamento que devem ser respeitadas pelo sistema antes de efetivar uma reserva.
* RN04: A reserva pode ser cancelada pelo criador ou por um Administrador. O sistema fará a alteração do status para `CANCELLED`, devendo registrar obrigatoriamente a data do cancelamento e o ID do usuário que executou a ação (Audit), não sendo recomendado uso de exclusão física.

---

## 🚫 6. Fora de Escopo

* Integração com sistemas externos de pagamento.
* Aplicativos mobile nativos.
* Controle financeiro de condomínio.

---

## ⚙️ 7. Requisitos Não Funcionais

* **Desempenho:** Respostas da API < 2s
* **Segurança:** JWT + Guards + ValidationPipe (whitelist)
* **Escalabilidade:** Suporte a múltiplos condomínios
* **Padronização:** Interceptors e tratamento global de erros

---

## 🛠️ 8. Tech Stack Principal (Diretrizes)

* **Backend:** NestJS (v11.0.1) + Prisma ORM (v7.6.0) + PostgreSQL via Neon (v16)
* **Frontend:** Vue.js (v3.5.30)
* **Monorepo:** Turborepo / Nx
* **CI/CD:**  GitHub Actions (Pipelines de Teste) + Deploy na Nuvem (Render/Vercel).

---
