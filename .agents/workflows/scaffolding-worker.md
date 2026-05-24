---
description: Configurar a fundação inicial do Monorepo (NestJS + Vue.js) baseando-se estritamente nas regras ditadas pelo Documento de Design de Software (`@docs/sdd.md`).
---

# Workflow: Day 0 (Scaffolding Architect) 🏗️

**Objetivo:** Configurar a fundação inicial do Monorepo (NestJS + Vue.js) baseando-se estritamente nas regras ditadas pelo Documento de Design de Software (`@docs/sdd.md`).
**Regra:** ZERO regra de negócio. Este workflow constrói apenas a infraestrutura e os provedores globais listados no SDD.
**REGRA DE OURO PARA A IA:** Quando instruída a pausar (🛑 PARADA OBRIGATÓRIA), você DEVE fazer a pergunta ao usuário e INTERROMPER o uso de qualquer ferramenta até receber a resposta de aprovação.
📏 REGRA DE FIDELIDADE TÉCNICA: É terminantemente proibido atualizar ou sugerir versões de bibliotecas (Prisma, Vue.js, NestJS) diferentes das especificadas no @docs/sdd.md. Antes de qualquer instalação ou configuração, você deve ler as versões no SDD e no package.json atual. Na dúvida, utilize a versão mais conservadora (a que está no SDD).

## 🎬 Bloco 1: Ingestão do SDD

1. **Leitura Obrigatória:** Leia o arquivo `@docs/sdd.md` na íntegra.
2. Resumo: Informe ao dev que leu o documento e liste as tecnologias/versões principais mapeadas (Prisma, Nest, Vue.js, Docker).
   🛑 PARADA OBRIGATÓRIA: Peça autorização para iniciar a auditoria do ambiente atual.

🔍 Bloco 1.1: Auditoria de Saúde (Health Check)
Este bloco identifica se estamos começando do zero ou alinhando um projeto em andamento.

Mapeamento de Terreno: Verifique a presença de arquivos base (package.json, schema.prisma, docker-compose.yml).

Diagnóstico de Entrada: - Cenário A (Projeto Novo): Se o diretório estiver vazio ou sem os arquivos citados, reporte: "Detectei um ambiente limpo. Estamos iniciando do zero conforme a arquitetura do SDD."

Cenário B (Projeto Existente): Se houver arquivos, apresente a tabela comparativa:

Tecnologia | Versão no SDD | Versão Instalada | Status (OK/Inconsistente).

Decisão: - Se Cenário B e houver inconsistências, pergunte: "Deseja que eu alinhe as versões agora ou ajustará manualmente?"
🛑 PARADA OBRIGATÓRIA: Não avance para o Scaffolding sem alinhar a base.

🛠️ Bloco 1.2: Fundação de Infraestrutura (Módulos 3, 4 e 9)

- **Workspace:** Verifique se o `package.json` raiz possui as rotinas de `workspaces` e os scripts `dev:api` e `dev:web`.
- **Infra:** Crie o `docker-compose.yml` local para o PostgreSQL (conforme Módulo 4.3).
- **Ambiente(Módulo 9):** Crie o .env.example com todas as chaves obrigatórias e valores fictícios de exemplo. Crie o arquivo .env, mas NÃO INVENTE SENHAS. Instrua o dev no terminal: "Eu criei o .env. Por favor, abra o arquivo agora e preencha as credenciais reais do seu Docker local (usuário/senha do banco) e defina um JWT_SECRET seguro."
- **Data Layer:** Inicialize o Prisma (`npx prisma init`). Deixe o `schema.prisma` limpo (sem tabelas de negócio).
- **Diretórios:** Crie a pasta `specs/` na raiz.
  🛑 **PARADA OBRIGATÓRIA:** Explique o que foi gerado, peça para o dev conferir se o banco subiu no Docker e se o `.env` está correto. Didática de Verificação:
- Docker: Peça para o dev rodar docker compose up -d e verificar com docker ps.
- Banco de Dados: Instrua o dev a testar a conexão:
  - Opção A (VS Code): Use a extensão SQLTools com o driver PostgreSQL.
  - Opção B (Visual): Rode npx prisma studio e veja se ele abre em localhost:5555.
  - Opção C (Terminal): docker exec -it <container_id> psql -U <user>.

Aprovação: "O banco está acessível? O .env foi preenchido com as credenciais reais? Podemos ir para o NestJS?"

## ⚙️ Bloco 2: Core do Backend NestJS (Módulos 6 e 7)

- **Configuração Segura (Módulo 9):** Instale `class-validator` e `class-transformer`. Crie a classe de validação rigorosa para o `.env` no `ConfigModule`.
- **Database (Módulo 6):** Crie o `PrismaModule` e o `PrismaService` como singleton providers globais.
- **Segurança e Filtros (Módulo 7):** Crie e ative globalmente o `GlobalExceptionFilter` (garantindo o exato formato JSON exigido no SDD) e ative o `ValidationPipe` (`whitelist: true`) no `main.ts`.
- **Documentação:** Configure o OpenAPI (Swagger) básico.
  🛑 **PARADA OBRIGATÓRIA:** Mostre o código do Filtro de Exceção e da Validação de ambiente. Peça para o dev a verificação.
  Didática de Verificação:
- Início: Peça para rodar npm run dev:api.
- Swagger: Instrua o dev a acessar http://localhost:3000/api.
  - Check: "Se o Swagger carregou, sua injeção de dependência do Prisma e a validação do .env estão OK."
- Aprovação: "Podemos avançar para o Frontend Vue.js?"

## 🎨 Bloco 3: Core do Frontend Vue.js (Módulos 3 e 10)

- **Variáveis de Ambiente (Módulo 9):** Configure as chaves no `.env` e acesso via `import.meta.env` no Vue.
- Tailwind 4: Configure via `@import "tailwindcss";` no `index.css`
- Shadcn-Vue: Configure o setup inicial conforme a documentação do Shadcn-Vue.
- **Core (Módulo 6.3 e 10):** Configure o `main.ts` instanciando o app Vue e o Router. Limpe o `App.vue` deixando apenas o `<RouterView />`.
  🛑 **PARADA OBRIGATÓRIA:** Explique as configurações feitas no `main.ts` e no Tailwind.
  Didática de Verificação:
- Smoke Test Page: Pergunte: "Deseja que eu crie uma componente de teste com um Button do Shadcn-Vue para validarmos se o Tailwind 4 e os estilos estão carregando corretamente?"
- Início: Peça para rodar npm run dev:web.
- Aprovação: "O botão apareceu com o estilo correto? Se sim, a integração Tailwind+Shadcn foi um sucesso."

## 🏁 Bloco 4: Teste de Ignição e Baseline

- Peça ao dev para abrir dois terminais na raiz e rodar `npm run dev:api` e `npm run dev:web`.
  🛑 **PARADA OBRIGATÓRIA:** Aguarde o dev confirmar que ambos compilaram sem erros de ambiente ou de injeção de dependência.
- Após o sucesso, sugira rodar o Prettier (`npm run format`).
- Liste a gigantesca Diff desta fundação e sugira a mensagem: `chore: setup inicial estruturado via SDD`.
  🛑 **PARADA OBRIGATÓRIA:** Peça para o dev revisar os arquivos. Se aprovado, efetive o `git add .` e o `git commit`.
- Encerre informando que o Monorepo "Tô Aqui!" está perfeitamente alicerçado e pronto para o `TDD Worker`.
