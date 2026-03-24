# 📄 Product Requirements Document (PRD) - Reserva Aí!

**Projeto:** Reserva Aí! (Gestão de Condomínios e Áreas Comuns)
**Versão:** 2.0.0
**Status:** 🟢 Definido (MVP Acadêmico)

---

## 🎯 1. Visão Geral e Objetivo

O gerenciamento manual de reservas de áreas comuns em condomínios é propenso a conflitos, falta de transparência e baixa rastreabilidade. O **Reserva Aí!** visa digitalizar e automatizar esse processo, permitindo que moradores realizem reservas de forma segura, enquanto administradores mantêm controle total sobre o uso das áreas.

O objetivo é fornecer uma plataforma web moderna, com autenticação segura, controle de acesso por papéis e validação rigorosa de dados, garantindo organização, confiabilidade e escalabilidade.

---

## 📖 2. Glossário Ubíquo

* **Reserva:** Agendamento de uso de uma área comum em um intervalo de tempo.
* **Área Comum:** Espaços compartilhados como salão de festas, churrasqueira, piscina.
* **Condomínio:** Entidade que agrupa usuários e áreas.
* **Usuário:** Morador ou administrador do sistema.
* **Admin:** Usuário com permissões elevadas de gestão.

---

## 👤 3. Atores e Permissões

* **Administrador (Admin):** Gerencia condomínios, áreas e usuários.
* **Morador (User):** Realiza reservas e consulta disponibilidade.
* **Sistema:** Valida regras de negócio, autenticação e conflitos de horários.

---

## 📝 4. Escopo Funcional (User Stories)

### 🔹 EPIC 1 — Arquitetura e Setup

| ID   | Ator      | Descrição                                            | Prioridade |
| ---- | --------- | ---------------------------------------------------- | ---------- |
| US01 | Dev       | Estruturar monorepo com frontend e backend no GitHub | 🔥 Crítica |
| US02 | Arquiteto | Criar PRD + SDD com diagramas Mermaid                | 🔥 Crítica |
| US03 | Dev       | Configurar GitFlow com PRs obrigatórios              | 🔥 Alta    |

### 🔹 EPIC 2 — Autenticação e Usuários

| ID   | Ator    | Descrição                                 | Prioridade |
| ---- | ------- | ----------------------------------------- | ---------- |
| US04 | Usuário | Cadastro com validação via DTO            | 🔥 Alta    |
| US05 | Usuário | Login com JWT                             | 🔥 Crítica |
| US06 | Admin   | Controle de acesso por roles (ADMIN/USER) | 🔥 Alta    |

### 🔹 EPIC 3 — Condomínios

| ID   | Ator    | Descrição                          | Prioridade |
| ---- | ------- | ---------------------------------- | ---------- |
| US07 | Admin   | CRUD de condomínios com Prisma ORM | 🔥 Alta    |
| US08 | Usuário | Listar condomínios vinculados      | ⚡ Média    |

### 🔹 EPIC 4 — Áreas Comuns

| ID   | Ator  | Descrição            | Prioridade |
| ---- | ----- | -------------------- | ---------- |
| US09 | Admin | CRUD de áreas comuns | 🔥 Alta    |

### 🔹 EPIC 5 — Reservas

| ID   | Ator    | Descrição                               | Prioridade |
| ---- | ------- | --------------------------------------- | ---------- |
| US10 | Usuário | Criar reserva com validação de conflito | 🔥 Crítica |
| US11 | Usuário | Cancelar reserva própria                | ⚡ Média    |
| US12 | Usuário | Listar reservas com filtros             | ⚡ Média    |

### 🔹 EPIC 6 — Padronização Backend

| ID   | Ator | Descrição                             | Prioridade |
| ---- | ---- | ------------------------------------- | ---------- |
| US13 | Dev  | Implementar interceptors globais      | ⚡ Média    |
| US14 | Dev  | Implementar exception filters globais | ⚡ Média    |

### 🔹 EPIC 7 — Qualidade e Testes

| ID   | Ator | Descrição                                 | Prioridade |
| ---- | ---- | ----------------------------------------- | ---------- |
| US15 | Dev  | Criar testes automatizados com Jest (TDD) | 🔥 Crítica |

### 🔹 EPIC 8 — Gestão Ágil

| ID   | Ator | Descrição                         | Prioridade |
| ---- | ---- | --------------------------------- | ---------- |
| US16 | Dev  | Mapear backlog no GitHub Projects | 🔥 Alta    |

---

## 🛡️ 5. Regras de Negócio

* RN01: Usuários devem estar autenticados para criar reservas.
* RN02: Não pode haver conflito de horário na mesma área.
* RN03: Apenas o criador pode cancelar a reserva.
* RN04: Administradores possuem acesso total.

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

* **Backend:** NestJS + Prisma ORM + PostgreSQL
* **Frontend:** VueJS ou React
* **Monorepo:** Turborepo / Nx
* **CI/CD:**  GitHub Actions (Pipelines de Teste) + Deploy na Nuvem (Render/Vercel).

---
