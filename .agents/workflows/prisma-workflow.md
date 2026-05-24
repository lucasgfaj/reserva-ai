---
description: Conectar a API do NestJS a um banco de dados PostgreSQL 16 real rodando em um container Docker, utilizando o Prisma v5 como ORM.
---

# Workflow: Persistência de Dados (Prisma + Docker)

**Objetivo:** Conectar a API do NestJS a um banco de dados PostgreSQL 16 real rodando em um container Docker, utilizando o Prisma v5 como ORM.
**Público-Alvo:** Alunos aprendendo sobre Banco de Dados, Docker, Variáveis de Ambiente e ORMs.

**REGRA DE OURO PARA A IA:** Você está atuando como um **Professor Assistente**. Antes de executar comandos, explique brevemente o conceito (ex: "O que é um Container" ou "O que é um ORM"). Quando encontrar a instrução 🛑 **PARADA OBRIGATÓRIA**, interrompa a execução, oriente o aluno a fazer a verificação manual e aguarde a aprovação.

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

## 🐳 Bloco 4.1: Infraestrutura com Docker

1. **Explicação Didática:** Explique que instalar um banco de dados direto no sistema operacional pode gerar conflitos de versão. O Docker cria uma "caixa isolada" (container) contendo o PostgreSQL 16, que podemos ligar e desligar facilmente.
2. **Ação:** Crie o arquivo `docker-compose.yml` na raiz do projeto configurando o serviço do PostgreSQL 16.
   - Defina a porta padrão `5432`.
   - Defina as variáveis de ambiente base (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`).

🛑 **PARADA OBRIGATÓRIA (Subindo o Banco):**

- **Didática:** O aluno precisa aprender a "ligar o motor" do banco de dados.
- **Ação do Aluno:** Peça para o aluno rodar o comando `docker compose up -d` no terminal da raiz e, em seguida, rodar `docker ps`.
- **Pergunta:** _"O comando `docker ps` listou o container do PostgreSQL rodando? Se sim, nosso servidor de banco de dados está vivo. Podemos ir para a conexão?"_

---

## 🔐 Bloco 4.2: Variáveis de Ambiente e Prisma ORM

1. **Explicação Didática:** Explique que o código fonte nunca deve conter senhas fixas (hardcoded). Usamos um arquivo `.env` para guardar essas chaves. Depois, explique que o Prisma é um ORM que escreve SQL por nós usando TypeScript.
2. **Ação de Ambiente:** Crie o `.env.example` com placeholders. Crie o `.env` real preenchido com a string de conexão (`DATABASE_URL`) apontando para o Docker local configurado no passo anterior.
3. **Ação de Instalação:** Instale o Prisma no workspace da API:
   - `npm install -w apps/api prisma --save-dev`
   - `npm install -w apps/api @prisma/client`
4. **Inicialização:** Execute `npx prisma init` dentro da pasta `apps/api`.
5. **Modelagem:** No arquivo `schema.prisma`, crie um modelo `User` simples (id, email, name) para substituir o array em memória do Workflow 2.

---

## 🔌 Bloco 4.3: Integração NestJS e Primeira Migration

1. **Explicação Didática:** O Prisma tem o esquema do banco, mas ele precisa criar as tabelas físicas lá dentro do Docker. Isso se chama "Migration".
2. **Ação de Migration:** Rode o comando `npx prisma migrate dev --name init` dentro de `apps/api`.
3. **Ação NestJS:** Crie a ponte entre o Nest e o Prisma criando os arquivos `prisma.service.ts` e `prisma.module.ts` dentro de `apps/api/src/prisma/`.
4. **Refatoração Mágica:** Altere o `UsersService` (criado no Workflow 2) para deletar o `private users = []` e passar a usar as funções do `PrismaService` (`create` e `findMany`).

---

## 🔬 Bloco 4.4: Inspeção Visual e Teste Real

1. **Explicação Didática:** Ver os dados apenas pelo terminal é abstrato. O Prisma Studio e o SQLTools são as nossas janelas para dentro do banco de dados físico.
2. **Ação:** Peça ao aluno para iniciar a API com `npm run dev:api`.

🛑 **PARADA OBRIGATÓRIA (A Prova do ORM):**

- **Didática:** É a hora de comprovar que o dado saiu da tela, passou pela API e gravou no disco.
- **Ação do Aluno:** 1. Vá ao Swagger (`http://localhost:3000/api`) e crie um usuário pelo POST `/users`. 2. Abra um novo terminal na pasta `apps/api` e rode `npx prisma studio`.
- **Pergunta:** _"Abra o Prisma Studio no navegador (localhost:5555). Você consegue ver a tabela 'User' e o registro que você acabou de criar lá dentro? (Alternativa: Você conseguiu visualizar no SQLTools?). Se o dado está lá, você acaba de dominar a persistência de dados! Podemos finalizar?"_

---

## 🏁 Bloco 4.5: Conclusão do Workflow 4 e do Setup

1. **Limpeza:** Sugira rodar o `npm run format`.
2. **Git Commit:** Sugira o commit final da fundação: `git add .` e `git commit -m "feat: integracao de banco de dados com docker, prisma e postgresql"`.
3. **Próximos Passos:** Parabenize o aluno. Diga: _"O Monorepo 'Tô Aqui!' está 100% completo e operacional. Temos Front, Back, Banco e Design System conectados. Agora estamos prontos para iniciar as Sprints de regras de negócio (Features) via TDD!"_