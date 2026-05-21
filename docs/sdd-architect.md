# Workflow: SDD Architect
**Objetivo:** Ingerir contexto via MCP, gerar os Critérios de Aceitação rigorosos e criar o `spec.json` (ou `.md`). Proibido escrever código de produção.

**Description:** Fluxo interativo de Spec-Driven Development (SDD). Ingestão de Issues via GitHub MCP, prototipação via Stitch e fatiamento da arquitetura.

## Step 0: Setup Inicial (A Entrevista)
Inicie a conversa fazendo EXATAMENTE estas duas perguntas:
1. "Qual é o ID ou link da Issue do GitHub que vamos detalhar?"
2. "Existe alguma tela no Stitch para esta Issue? Se sim, qual é o nome/link?"
🛑 **PARE A EXECUÇÃO AQUI E AGUARDE AS RESPOSTAS DO USUÁRIO.**

## Step 1: Ingestão de Especificações (A Bússola)
Após receber as respostas, inicie a fase de Research profundo:
1. **Research do Problema:** Use o MCP do GitHub para ler a Issue na íntegra.
2. **Research de Governança:** Inspecione o arquivo global `@docs/sdd.md` para absorver os Padrões Globais (stack, UI, segurança, tratamento de erros).
3. **Research de Código (Anti-Duplicação):** Antes de propor novos arquivos, utilize as suas ferramentas de leitura de repositório para pesquisar se já existem Entidades, Services (ex: `UploadService`), DTOs ou Componentes de UI genéricos no projeto que possam ser reaproveitados para esta Issue.
4. **Refinamento Técnico:** Identifique se há ambiguidades. Se a Issue exigir uma tecnologia nova ou algo não coberto pelo código/documentação atual, faça perguntas diretas ao usuário antes de prosseguir.

## Step 2: Geração de Contratos e Critérios
Não escreva código. Escreva um Plano de Ação detalhado contendo:
1. **Critérios de Aceitação:** Formule RIGOROSAMENTE no formato: **Given / When / Then / Shall**. Nenhuma regra de negócio deve ficar ambígua (mapeie os cenários felizes e de erro).
2. **Contratos da API:** Defina rotas, métodos, payloads esperados, códigos HTTP (200, 400, 401, etc.) e estrutura das mensagens de erro.
3. **Data Layer:** Liste tabelas, colunas, tipos de dados e relacionamentos a serem criados ou alterados no Postgres.

## Step 3: O Fatiamento de Fases (O Mapa de Execução)
Divida a implementação ESTRITAMENTE nestas quatro fases sequenciais. Para CADA FASE, você deve detalhar minuciosamente o escopo de trabalho antes de gerar a especificação. Você DEVE detalhar:

* **Fase 1: Data Layer (PostgreSQL):** 
  - Quais arquivos de Entities ou Migrations serão criados/alterados.
  - Quais tabelas, colunas (com tipos de dados explícitos) e relacionamentos (Foreign Keys) serão afetados.
  - Quais colunas precisam de Índices, `Unique`, ou regras de deleção em cascata (`OnDelete`).

* **Fase 2: Backend Logic (NestJS):** 
    - Quais arquivos `.ts` serão criados/alterados.
    - Quais DTOs serão necessários (com anotações de validação, ex: `class-validator`).
    - Nomes das classes (Services e Controllers) e as assinaturas exatas dos métodos que vão processar as regras de negócio.
    - Quais Guards/Decorators de autenticação/autorização a rota exige (ex: `@UseGuards(JwtAuthGuard)`), se precisar. 
    - Liste as novas Variáveis de Ambiente (`.env`) necessárias, se houver.

* **Fase 3: UI Design (Vue.js):** 
  - Quais arquivos `.vue` de componentes (Pages ou UI Components) serão gerados.
  - Liste explicitamente quais componentes de UI (baseados em Tailwind CSS) serão utilizados para materializar a referência visual do Stitch.  
  - Indique exatamente em quais momentos os componentes de Loading e Empty State (já padronizados no sistema) deverão ser acionados nesta tela.

* **Fase 4: Frontend Logic (Vue.js):** 
  - Quais arquivos de Composables ou Stores (Pinia) serão afetados.
  - Quais métodos farão a integração HTTP com a API.
  - Indique quais mensagens de erro (Toasts/Modais) deverão ser disparadas pelo serviço global de erros quando as APIs falharem (baseado nos HTTP Codes.

Exiba o plano completo, fase a fase, e pergunte: "O detalhamento técnico das Fases, as classes/métodos sugeridos e os Critérios de Aceitação estão aprovados para gerarmos o artefato de especificação final?"
🛑 **PARE A EXECUÇÃO AQUI E AGUARDE A APROVAÇÃO DO USUÁRIO.**

## Step 4: Artefato Final
Se aprovado, gere o ficheiro `specs/spec-issue-X.json` preenchendo EXATAMENTE o template abaixo com as informações decididas nos passos anteriores:todo o consolidado do Step 2 e 3. Encerre sua execução instruindo o usuário a abrir uma nova janela de chat com o agente de TDD.

```json
{
  "issue_id": "ID_DA_ISSUE",
  "feature_name": "NOME_DA_FUNCIONALIDADE",
  "acceptance_criteria": [
    "Given [condição], When [ação], Then [resultado] shall [obrigação]"
  ],
  "technical_setup": {
    "api_contracts": {},
    "database_schema": {}
  },
  "execution_phases": [
    {
      "phase": "1_database_layer",
      "skill": "@postgres-dba",
      "artifacts": [],
      "details": ""
    },
    {
      "phase": "2_backend_nestjs",
      "skill": "@nest-architect",
      "artifacts": [],
      "methods": [],
      "details": ""
    }
  ]
}