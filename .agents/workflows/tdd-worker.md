---
description: Linha de montagem automatizada para Vue.js, NestJS e PostgreSQL.
---

# Workflow: TDD Worker

**Objetivo:** Executar o fatiamento vertical (Data -> Back -> UI -> Front) baseado estritamente no documento de especificação gerado na pasta `specs/`, utilizando o ciclo Red-Green-Refactor do TDD e Commits Atômicos.

**Description:** Linha de montagem automatizada para Vue.js, NestJS e PostgreSQL.

## Step 0: Setup Inicial e Ingestão de Contexto

Inicie a conversa EXATAMENTE com esta pergunta:

1. "Qual é o nome do ficheiro `spec-issue-X.json` localizado na pasta `specs/` que vamos implementar nesta sessão?"
   🛑 **PARE A EXECUÇÃO AQUI E AGUARDE A RESPOSTA DO USUÁRIO.**

Após a resposta: 2. Leia o ficheiro JSON fornecido. 3. Leia o ficheiro global `@docs/sdd.md` para carregar as regras de negócio, testes e segurança. 4. Confirme a leitura exibindo um resumo das 4 Fases de Execução e informe que iniciará o loop pela Fase 1.

## Step 1: O Ciclo TDD Universal (Aplicar em CADA fase)

Para cada fase descrita no JSON, você DEVE seguir este ciclo exato:

1. **Escrever Testes (Red):** Redija os testes (`.spec.ts`) PRIMEIRO. **Regra de Ouro:** É estritamente proibido criar testes "ocos" (ex: `expect(mock).toHaveBeenCalled()`). Os testes devem validar mudanças de estado reais ou interações no DOM.
2. **Esqueleto Inicial:** Crie os arquivos e as assinaturas de métodos/classes vazias apenas para o TypeScript e o Linter não reclamarem.
3. **Pausa para Aprovação:** Pergunte: _"Testes redigidos para a [Fase Atual]. Posso executar a implementação da lógica?"_
   🛑 **PARE A EXECUÇÃO AQUI E AGUARDE APROVAÇÃO.**
4. **Implementação (Green) e Auto-Correção:** Escreva a lógica para fazer os testes passarem. Rode o comando de teste no terminal.
   - _Correção:_ Se falhar (vermelho), leia o erro e corrija o código. **Limite de 3 tentativas.** Se falhar 3 vezes, PARE e peça ajuda ao Tech Lead.
5. **GitFlow (Commit Atômico):** Se o teste passar (verde) e o Linter aprovar, **imediatamente** rode `git add .` (apenas nos arquivos da fase) e faça um commit semântico (ex: `feat(api): implementa validacao da rota`).

## Step 2: Playbook de Execução das Fases

Execute as fases sequencialmente, aplicando estas regras táticas:

- **Fase 1 (Data Layer):** - Altere o `schema.prisma`.
  - **Segurança:** O comando `prisma migrate dev` DEVE ser rodado contra o banco Docker local.
  - **Zero-Downtime:** É proibido deletar colunas ou tabelas (`DROP`). Utilize apenas _Expand and Contract_.

- **Fase 2 (Backend NestJS):** - Implemente DTOs, Services e Controllers baseados no JSON.
  - Valide status HTTP de sucesso e erro (Idempotência). Teste falhas do Prisma (ex: Unique Key P2002).
  - Verifique e tipifique variáveis de ambiente (`.env`) necessárias.

- **Fase 3 (UI Design Vue.js):** - Prototipe os componentes HTML utilizando o **Spartan UI (HLM/Brain)** e classes utilitárias do Tailwind.
  - Implemente e teste os estados transitórios (Loading Spinners, Empty States) exigidos no JSON.

- **Fase 4 (Frontend Logic Vue.js):** - Integre a UI com os Composables/Stores (Pinia).
  - Teste a manipulação do DOM.
  - Implemente o tratamento global de exceções exibindo Toasts para erros 4xx/5xx mapeados no JSON.

## Step 3: Encerramento

Após o commit atômico da Fase 4 estar concluído com sucesso, exiba uma mensagem final de sucesso: "Funcionalidade entregue de ponta a ponta" e encerre o workflow.
