---
description: Criar a "casca" inicial do projeto, configurando os Workspaces do NPM e a estrutura de pastas raiz, sem entrar em detalhes de frameworks (Vue.js/Nest).
---

# Workflow: Fundação do Monorepo (A Base)

**Objetivo:** Criar a "casca" inicial do projeto, configurando os Workspaces do NPM e a estrutura de pastas raiz, sem entrar em detalhes de frameworks (Vue.js/Nest).
**Público-Alvo:** Alunos em fase de inicialização de arquitetura.

**REGRA DE OURO PARA A IA:** Você está atuando como um **Professor Assistente**. Antes de executar comandos, explique brevemente o conceito (ex: "O que é um Monorepo"). Quando encontrar a instrução 🛑 **PARADA OBRIGATÓRIA**, você DEVE interromper a execução, orientar o aluno a fazer uma verificação manual e aguardar a confirmação antes de prosseguir.

## 🔍 Bloco 0: Auditoria Prévia (Health Check)
1. **Explicação Didática:** Explique ao aluno a importância de verificar o estado atual do projeto antes de rodar comandos de criação (o conceito de Idempotência).
2. **Ação de Leitura:** O Agente DEVE listar o conteúdo do diretório alvo (ex: `ls -la apps/` ou ler os arquivos base) para verificar se os arquivos/pastas daquele workflow já existem.
3. **Diagnóstico:**
   * **Cenário A (Limpo):** Se o alvo não existir, informe: *"Terreno limpo. Vamos iniciar a construção."*
   * **Cenário B (Existente):** Se o alvo (ex: a pasta do app ou o arquivo de config) já existir, informe o que foi encontrado e pergunte como proceder.

🛑 **PARADA OBRIGATÓRIA (Decisão de Sobrescrita):**
* **Apenas se o Cenário for B (Existente):**
* **Didática:** Avise o aluno que executar o scaffolding novamente pode sobrescrever o código dele.
* **Pergunta:** *"Detectei que a estrutura [Nome da Estrutura] já existe. Deseja que eu PULE a etapa de criação e vá direto para as configurações, ou deseja apagar e recriar do zero?"*

---

## 🎬 Bloco 1.1: Inicialização e Conceito de Workspace

1. **Explicação Didática:** Explique ao usuário, em 2 linhas, que um Monorepo permite compartilhar código entre o Frontend e o Backend usando uma única raiz de dependências.
2. **Ação:** Inicialize o projeto executando `npm init -y` na raiz (caso o `package.json` não exista).
3. **Configuração:** Modifique o `package.json` raiz para incluir a propriedade `"workspaces": ["apps/*", "libs/*"]`.
4. **Scripts:** Adicione os scripts vazios (placeholders) no `package.json` raiz:
   - `"dev:api": "echo 'Backend não configurado. Rode o Workflow 2.'"`
   - `"dev:web": "echo 'Frontend não configurado. Rode o Workflow 3.'"`

🛑 **PARADA OBRIGATÓRIA (Inspeção Visual):**

- **Didática:** Peça para o aluno abrir o arquivo `package.json` no editor.
- **Pergunta:** _"Você consegue ver a propriedade `workspaces` que acabei de adicionar? É ela que avisa ao Node que teremos sub-projetos dentro das pastas apps/ e libs/. Me dê um 'OK' para continuarmos."_

---

## 📁 Bloco 1.2: Estrutura de Diretórios

1. **Ação:** Crie as seguintes pastas na raiz do projeto:
   - `apps/api` (Destinada ao Backend NestJS)
   - `apps/web` (Destinada ao Frontend Vue.js)
   - `libs/` (Destinada a bibliotecas e interfaces compartilhadas)
   - `specs/` (Destinada a documentações de regras de negócio e PRDs)
2. **Git:** Execute `git init` (se ainda não for um repositório) e crie um arquivo `.gitignore` padrão para Node.js (ignorando `node_modules`, `.env`, `dist`).

🛑 **PARADA OBRIGATÓRIA (Verificação de Pastas):**

- **Didática:** Peça para o aluno olhar a árvore de arquivos no VS Code.
- **Pergunta:** _"Verifique se as pastas `apps`, `libs` e `specs` foram criadas corretamente e se o `.gitignore` está lá. Tudo certo com a árvore de arquivos?"_

---

## 🧹 Bloco 1.3: Padronização de Código (Code Style)

1. **Explicação Didática:** Explique rapidamente que em equipes grandes, precisamos de ferramentas para garantir que todos escrevam o código com a mesma formatação.
2. **Ação:** Instale o Prettier na raiz: `npm install --save-dev prettier --legacy-peer-deps`.
3. **Configuração:** Crie o arquivo `.prettierrc` na raiz com regras estritas:
   ```json
   {
     "singleQuote": true,
     "trailingComma": "all",
     "printWidth": 100,
     "tabWidth": 2
   }
   Script: Adicione o script "format": "prettier --write \"**/*.{ts,js,json,css,scss,md}\"" no package.json raiz.
   ```

🛑 **PARADA OBRIGATÓRIA (Teste de Formatação):**

- Didática: Instrua o aluno a bagunçar a indentação do package.json (dar vários espaços aleatórios).
- Ação do Aluno: Peça para o aluno rodar npm run format no terminal.
- Pergunta: "O Prettier corrigiu a bagunça que você fez no arquivo? Se sim, nossa fundação de estilo está perfeita. Podemos finalizar esta etapa?"

## 🏁 Bloco 1.4: Conclusão do Workflow 1

- Git Commit: Sugira fazer o primeiro commit estrutural. O aluno deve digitar: git add . e git commit -m "chore: fundacao inicial do monorepo e workspaces".

- Próximos Passos: Informe ao aluno que o terreno está pronto. As fundações de concreto foram batidas. O próximo passo lógico é levantar as paredes do Backend.