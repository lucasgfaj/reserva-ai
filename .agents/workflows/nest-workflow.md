---
description: Levantar o servidor Backend com regras de segurança, validação rigorosa (DTOs) e documentação OpenAPI (Swagger), utilizando dados em memória para fins didáticos.
---

# Workflow: NestJS Core (A API Pura)

**Objetivo:** Levantar o servidor Backend com regras de segurança, validação rigorosa (DTOs) e documentação OpenAPI (Swagger), utilizando dados em memória para fins didáticos.
**Público-Alvo:** Alunos iniciando o estudo de Arquitetura de APIs e Ciclo de Vida HTTP.

**REGRA DE OURO PARA A IA:** Você está atuando como um **Professor Assistente**. Antes de executar comandos, explique brevemente o conceito (ex: "O que é um DTO" ou "Para que serve o Swagger"). Quando encontrar a instrução 🛑 **PARADA OBRIGATÓRIA**, interrompa a execução, oriente o aluno a fazer a verificação manual e aguarde a aprovação.

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

## 🏗️ Bloco 2.1: Scaffolding do NestJS

1. **Explicação Didática:** Explique ao aluno que o NestJS usa uma arquitetura modular inspirada no Vue.js, dividindo responsabilidades entre Controllers (Rotas) e Services (Regras de Negócio).
2. **Ação:** Instale o CLI do Nest globalmente (se necessário) ou use via npx para gerar a aplicação dentro da pasta `apps/api`:
   - `npx @nestjs/cli new api --directory apps/api --skip-git --package-manager npm`
3. **Ajuste de Workspace:** Atualize o script no `package.json` da raiz para apontar para o novo app:
   - `"dev:api": "npm run start:dev -w apps/api"`

🛑 **PARADA OBRIGATÓRIA (Primeiro Teste do Servidor):**

- **Didática:** O aluno precisa ver o servidor "respirar" pela primeira vez.
- **Ação do Aluno:** Peça para o aluno abrir o terminal na raiz e rodar `npm run dev:api`. Em seguida, acessar `http://localhost:3000` no navegador.
- **Pergunta:** _"Apareceu a mensagem 'Hello World!' na sua tela? Isso significa que o motor do NestJS está rodando perfeitamente. Podemos avançar para a configuração de Segurança?"_

---

## 🛡️ Bloco 2.2: Segurança e Validação (Pipes e DTOs)

1. **Explicação Didática:** Explique que nunca devemos confiar nos dados enviados pelo usuário (Frontend). O `class-validator` atua como um "segurança de balada", barrando requisições com dados incorretos antes mesmo de chegarem ao nosso código.
2. **Ação:** Instale as dependências no workspace da API: `npm install -w apps/api class-validator class-transformer`.
3. **Configuração Global:** No arquivo `apps/api/src/main.ts`, ative o `ValidationPipe` globalmente com a opção `whitelist: true` (que remove campos extras não mapeados no DTO).

---

## 🚨 Bloco 2.3: Tratamento de Erros (Exception Filter)

1. **Explicação Didática:** Mostre que mensagens de erro confusas quebram o Frontend. O SDD exige um formato JSON estrito para que o Vue.js saiba exatamente como ler o erro.
2. **Ação:** Crie o arquivo `apps/api/src/common/filters/global-exception.filter.ts`.
3. **Código:** Implemente a interface `ExceptionFilter` para capturar `HttpException` e retornar exatamente este formato (conforme SDD):
   ```json
   {
     "statusCode": 400,
     "timestamp": "2026-03-20T23:19:20.000Z",
     "path": "/api/rota",
     "message": "Descrição do erro"
   }
   ```
4. Ativação: Registre o filtro globalmente no main.ts.

## 📖 Bloco 2.4: Documentação Interativa (Swagger) e Mock Service

- **Explicação Didática:** Explique que o Swagger é o "cardápio" da nossa API, onde o Frontend consulta quais rotas existem e pode testá-las sem precisar escrever código.
- **Ação Swagger:** Instale `@nestjs/swagger` no workspace da API e configure o `DocumentBuilder` no `main.ts` com o path `/api`.
- **Ação Mock Service (Prática):** Crie um `UsersController` e `UsersService` simples na API.
  - **Regra:** O service DEVE usar um array em memória (`private users = []`).
  - **Rotas:** Crie um `POST /users` (que receba um DTO com `name` e `email` validados) e um `GET /users` (que retorne o array).

🛑 **PARADA OBRIGATÓRIA (O Teste de Fogo do Backend):**

- **Didática:** Agora o aluno vai testar tudo o que foi construído (Validação, Filtro de Erro e Swagger).
- **Ação do Aluno:** Peça para o aluno acessar `http://localhost:3000/api` no navegador.
- **Instruções de Teste para o Aluno:**
  1. Tente usar o `POST /users` sem enviar o email (para ver o `ValidationPipe` e o `ExceptionFilter` retornando o erro JSON bonito).
  2. Tente enviar os dados corretos e depois use o `GET /users` para ver o dado salvo na memória RAM.
- **Pergunta:** _"Você conseguiu ver o erro customizado e também salvar um usuário na memória? Se sim, a sua arquitetura REST está perfeita. Podemos dar o commit desta etapa?"_

---

## 🏁 Bloco 2.5: Conclusão do Workflow

- **Limpeza:** Sugira rodar o `npm run format`.
- **Git Commit:** Sugira o commit: `git add .` e `git commit -m "feat: core do nestjs com swagger, validacao global e mock service"`.
- **Próximos Passos:** Informe ao aluno que o Backend sabe se comunicar, mas ainda perde dados quando o servidor reinicia. O próximo passo lógico é dar uma "cara" visual a esse projeto com o **Workflow (Vue.js)**, ou plugar o banco de dados definitivo com o **Workflow (Prisma)**.