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

| ID | Ator | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **US01** | Usuário | Realizar cadastro e acesso ao sistema para utilizar as funcionalidades disponíveis. | 🔥 Crítica |
| **US02** | Administrador | Cadastrar e gerenciar condomínios no sistema. | 🔥 Alta |
| **US03** | Administrador | Vincular usuários aos respectivos condomínios. | 🔥 Alta |
| **US04** | Administrador | Cadastrar e gerenciar áreas comuns disponíveis para reserva. | 🔥 Crítica |
| **US05** | Usuário | Visualizar as áreas comuns disponíveis no condomínio. | 🔥 Alta |
| **US06** | Usuário | Consultar a disponibilidade de uma área comum em data e horário desejados. | 🔥 Crítica |
| **US07** | Usuário | Realizar uma reserva de área comum em um período disponível. | 🔥 Crítica |
| **US08** | Usuário | Cancelar uma reserva realizada anteriormente. | ⚡ Média |
| **US09** | Usuário | Consultar o histórico das próprias reservas. | ⚡ Média |
| **US10** | Administrador | Visualizar todas as reservas realizadas no condomínio. | 🔥 Alta |
| **US11** | Administrador | Acompanhar conflitos, cancelamentos e uso das áreas comuns. | ⚡ Média |
| **US12** | Sistema | Impedir reservas em horários conflitantes para a mesma área comum. | 🔥 Crítica |

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
* **Frontend:** React
* **Monorepo:** Turborepo / Nx
* **CI/CD:**  GitHub Actions (Pipelines de Teste) + Deploy na Nuvem (Render/Vercel).

---
