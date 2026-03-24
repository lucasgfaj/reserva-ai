# 📖 Checklist de Avaliação | ID & RA

> **Projeto:** Tô Aqui! (AutoPresence UTFPR)  
> **Disciplina:** Tópicos Especiais em Programação  
> **Docente:** Roni Fabio Banaszewski

---

## 🎯 RA1 - Arquitetura, Engenharia de Requisitos com IA e Gestão Ágil
* [ ] **ID1:** Estruturou o **PRD** e o **SDD** (Diagrama Mermaid) de forma clara, utilizando a IA para modelar o negócio.
* [ ] **ID2:** A aplicação foi estruturada em formato de **Monorepo** (Front + Back) no GitHub.
* [ ] **ID3:** Mapeou o PRD em **Histórias de Usuário** no GitHub Projects, criando um backlog rastreável de Issues.
* [ ] **ID4:** Demonstrou domínio do **GitFlow**, isolando features e utilizando Pull Requests para integração.

---

## ⚙️ RA2 - Desenvolvimento Backend Assistido por IA
* [ ] **ID5:** O código NestJS mantém **separação estrita de camadas** arquiteturais (Controllers, Services, Modules).
* [ ] **ID6:** Aplicou **DTOs** e `ValidationPipes` (com `whitelist`) para blindar as entradas da API.
* [ ] **ID7:** Implementou operações **CRUD relacionais** utilizando Prisma ORM.
* [ ] **ID8:** Configurou **autenticação JWT** e protegeu rotas através de controle de acesso (Roles/Guards).
* [ ] **ID9:** Padronizou o tráfego com **Interceptors** para respostas e **Exception Filters** globais para erros.

---

## 🧪 RA3 - Qualidade de Software e TDD Guiado por IA
* [ ] **ID10:** Orquestrou a IA no fluxo **TDD**, gerando testes automatizados (Jest) baseados nas Issues antes da implementação da lógica.
* [ ] **ID11:** Os **testes** locais ou no pipeline executam com sucesso, cobrindo caminhos de sucesso e erro.

---

## 🎨 RA4 - Prototipagem e Integração Frontend
* [ ] **ID12:** A API do backend expõe documentação **Swagger (OpenAPI)** atualizada e interativa.
* [ ] **ID13:** Materializou o PRD em **interfaces visuais** (React/Angular/Vue) utilizando prototipagem assistida por IA.
* [ ] **ID14:** A interface consome os dados reais da API NestJS de forma síncrona, lidando corretamente com os **tokens JWT**.

---

## 🚀 RA5 - Pipeline CI/CD e Implantação Contínua
* [ ] **ID15:** As credenciais e **variáveis sensíveis** (como a `DATABASE_URL` da nuvem) estão seguras, ocultas do GitHub e injetadas via `ConfigModule`.
* [ ] **ID16:** Configurou esteira de **CI (Continuous Integration)** via GitHub Actions para validação automática de código (Jest/Linting) antes do merge.
* [ ] **ID17:** Realizou o **deploy** da aplicação em domínio público (nuvem), conectada a um banco de dados relacional em produção (Neon.tech).

---
_Este checklist deve ser mantido na pasta `/docs` do repositório para acompanhamento do progresso da equipe._