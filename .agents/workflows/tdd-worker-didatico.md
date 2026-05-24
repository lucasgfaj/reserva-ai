---
description: Linha de montagem explicativa focada em NestJS, Vue.js e PostgreSQL. Cada passo exige revisão e aprovação do dev.
---

# Workflow: TDD Worker - MODO DIDÁTICO 🛠️

**Objetivo:** Guiar o dev na implementação de uma funcionalidade, fatiando o desenvolvimento em Fases (Data, Back, UI, Front), invocando especialistas técnicos (skills) e garantindo fidelidade total ao @docs/sdd.md, garantindo que a fundação seja sólida (PostgreSQL), o contrato seja respeitado (Prisma), a arquitetura seja limpa (NestJS) e a interface seja reativa e moderna (Vue.js Composition API), tudo isso enquanto ensina o dev a seguir processos de elite (GitFlow/TDD).

**Descrição:** Linha de montagem explicativa focada em NestJS, Vue.js e PostgreSQL. Cada passo exige revisão e aprovação do dev.
**REGRA DE OURO PARA A IA:** Quando instruída a pausar (🛑 PARADA OBRIGATÓRIA), você DEVE fazer a pergunta ao usuário e INTERROMPER o uso de qualquer ferramenta (terminal, arquivos) até receber a resposta de aprovação. Não encadeie ações.

📏 REGRA DE FIDELIDADE: É terminantemente proibido sugerir versões de bibliotecas diferentes das especificadas no SDD. A "Constituição" do projeto (SDD) prevalece sobre qualquer conhecimento geral da IA.

## Step 0: Início da Sessão e Contexto

Inicie a conversa solicitando o arquivo de planejamento:

1. "Olá, Dev! Qual é o nome do arquivo `spec-issue-X.json` na pasta `specs/` que vamos implementar neste pareamento?"
   🛑 **PARADA OBRIGATÓRIA:** **PARE A EXECUÇÃO E AGUARDE A RESPOSTA.**

2. Análise de Contrato: Leia o JSON da Issue e o @docs/sdd.md. Apresente um resumo técnico do que será construído (Ex: "Implementaremos o endpoint X com validação Y e o componente UI Z usando Shadcn-Vue").
   🛑 PARADA OBRIGATÓRIA: Pergunte se o escopo está correto.

3. Auditoria de Baseline: Antes de qualquer código, leia o @docs/sdd.md e o package.json. Apresente uma tabela:
   Tecnologia | Versão SDD | Versão Atual | Status (OK/Inconsistente).
   Se houver erro (ex: Prisma v7 em vez de v5), pergunte se deve corrigir ou o dev fará manualmente, antes de seguir.
   🛑 PARADA OBRIGATÓRIA.

4. GitFlow: Verifique a branch atual. Se estiver na main ou develop, crie a feature/nome-da-issue.
   Confirmação: Informe o nome da branch ativa e confirme que todos os commits das próximas 4 Fases serão centralizados nela.
   🛑 PARADA OBRIGATÓRIA.

5. Ativação de Especialistas: Confirme a prontidão e orquestração das Skills para o ciclo:

Fase 1 (Data): postgresql + prisma-expert (Tipos nativos, performance e índices FK).

Fase 2 (Back): nest-expert + prisma-expert (Services, DTOs e Testes E2E).

Fase 3 (UI): vue-best-practices (Shadcn-Vue, Tailwind e Acessibilidade).

Fase 4 (Front): vue-best-practices (Composables, Pinia e Reatividade).
🛑 PARADA OBRIGATÓRIA: "Squad de especialistas pronto. Podemos iniciar a Fase 1: Data Layer?"

## Step 1: O Ciclo de Pareamento (Aplicar em CADA uma das 4 Fases)

Diretrizes Táticas por Fase:

- **Fase 1 (Data Layer):** Foco em `schema.prisma` e migrações no Docker. Explique a estratégia de _Expand and Contract_ em vez de usar `DROP`.
- **Fase 2 (Backend NestJS):** Foco em DTOs, Services e testes. Demonstre como criar testes unitários para a regra de negócio e testes E2E (usando supertest) para validar a rota HTTP conectada ao Prisma. Demonstre como os erros da API são padronizados conforme o SDD.
- **Fase 3 (UI Design Vue.js):** Foco em HTML e componentes **Shadcn-Vue**. Mostre como o Tailwind resolve o visual e o estado transitório.
- **Fase 4 (Frontend Logic Vue.js):** Foco na integração. Explique como o **Axios/Fetch** e os Composables fazem a ponte dos dados para a tela de forma reativa.

Para cada fase ([1]Data, [2]Back, [3]UI, [4]Front), execute este sub-ciclo de três paradas:

### 1.1. A Camada de Testes (RED)

- Ação: Invoque os especialistas da fase.
- Se estiver na Fase 1: Valide o esquema (prisma validate) e explique o modelo de dados. Não crie arquivos .spec.ts.
- Se estiver nas Fases 2, 3 ou 4: Escreva apenas os arquivos de teste (.spec.ts) e os esqueletos das classes/interfaces (sem lógica).
- Explicação Didática: Mostre como os Critérios de Aceitação do JSON viraram testes ou restrições de banco.
  🛑 **PARADA OBRIGATÓRIA:** Os testes/design fazem sentido? Posso prosseguir?.

### 1.2. A Implementação da Lógica (GREEN)

- Escreva o código real com as skills experts para fazer os testes passarem. Rode os testes no terminal e mostre o resultado "Verde".
- Se houver falha, tente corrigir (limite de 3 vezes). Se falhar a 3ª, pare e peça para o dev analisar os logs do terminal junto com você.
- Se passar, explique as decisões arquiteturais tomadas (ex: uso de Decorators no NestJS ou Composables no Vue.js).
  🛑 **PARADA OBRIGATÓRIA:** Pergunte "A implementação está clara? Posso prosseguir para a revisão e commit?" e aguarde a resposta.

### 1.3. O Checkpoint (Revisão e Commit)

- Execute o formatador (Prettier).
- Verifique e mostre ao dev a branch atual (garanta e explique que os commits de todas as fases ocorrerão na mesma `feature/nome-da-issue` seguindo o GitFlow).
- Liste claramente quais arquivos foram alterados nesta fase e sugira a mensagem do commit semântico.
- Peça ao dev: "Por favor, revise as diferenças (diffs) dos arquivos no seu painel. A mensagem do commit e as alterações estão corretas? Posso efetivar o commit?"
  🛑 **PARADA OBRIGATÓRIA:** Peça: "Por favor, revise as diffs no painel. Tudo certo para eu efetivar o commit?" e aguarde o "Sim".
- Somente após o "Sim", execute `git add .` e `git commit`. Avise que a fase terminou.
- Com o commit salvo, pergunte se estão prontos para avançar para a próxima fase.
  🛑 **PARADA OBRIGATÓRIA:** **PARE A EXECUÇÃO E AGUARDE APROVAÇÃO.**

## Step 2: Teste de Mesa (Validação Prática)

Após concluir as 4 Fases:

- Verifique se o servidor NestJS e o Vue.js estão rodando. Se não estiverem, inicie-os abrindo dois terminais separados na raiz do projeto e executando os scripts de workspace: `npm run dev:api` e `npm run dev:web`.
- Informe ao dev quais são as URLs locais (ex: `localhost:5173` e `localhost:3000`).
- Peça ao dev: "Acesse a aplicação e teste a funcionalidade visualmente/manualmente para garantirmos que a integração está perfeita."
  🛑 **PARADA OBRIGATÓRIA:** Aguarde o feedback prático do dev. Se houver bugs visuais, corrija-os. Se o feedback for positivo, siga para o Bloco 5.

## Step 3: Conclusão e Pull Request (PR)

Após o commit da Fase 4 ser finalizado com sucesso:

- Faça um resumo consolidado de todos os arquivos integrados.
- Informe ao dev que a funcionalidade está pronta na branch local e sugira o comando para subir para o remoto (ex: `git push origin feature/nome-da-issue`).
- Oriente o dev sobre a abertura do Pull Request (PR), lembrando-o de usar o arquivo JSON da Issue como base para a descrição do PR.
- Parabenize o dev pela funcionalidade entregue!
