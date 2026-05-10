# 📄 Atividade 16 - Documentação Swagger - Reserva Aí!

**Data:** 10 de Maio de 2026  
**Projeto:** Reserva Aí! - API de Gestão de Condomínios

---

## 📋 1. Prints da Interface Swagger

### 1.1 Swagger UI - Visão Geral (`/api/v1/docs`)

A documentação interativa está disponível em: `http://localhost:3000/api/v1/docs`

![Swagger UI - Reserva Aí API](http://localhost:3000/api/v1/docs)

### 1.2 Endpoint Público: `/api/v1/auth/login`

- **Método:** POST
- **Tags:** auth
- **Descrição:** Realiza login de administrador ou morador
- **Autenticação:** Nenhuma (público)
- **Status 200:** Login realizado com sucesso
- **Status 401:** Credenciais inválidas

### 1.3 Endpoint Protegido: `/api/v1/common-areas`

- **Método:** GET
- **Tags:** common-areas
- **Descrição:** Lista todas as áreas comuns do condomínio
- **Autenticação:** JWT Bearer (Requer token válido)
- **Status 200:** Lista de áreas retornada com sucesso
- **Status 401:** Token não fornecido

### 1.4 DTO Documentado: `LoginDto`

```typescript
{
  "email": "admin@reservaai.com.br",
  "password": "SenhaSegura123!"
}
```

---

## 🔐 2. Uso do Botão "Authorize" (JWT)

### Passo a Passo:

1. **Fazer Login** via `/auth/login` e copiar o `accessToken` retornado
2. **Clicar no botão "Authorize"** no Swagger UI
3. **Colar o token** no campo: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. **Confirmar** para testar rotas protegidas

### Exemplo de Token JWT:

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMmU0OGQ2OC0zNmJhLTQ4ZGQtODZkYS1kY2ZiNWY3MjM2ZDYiLCJlbWFpbCI6ImFkbWludGVzdGVjdXJsQHRlc3RlLmNvbSIsInJvbGUiOiJBRE1JTiIsImNvbmRvbWluaXVtSWQiOiJmMWI5ZDE2ZC03MThjLTQyNDEtOGZkZS0zNzIxZDg3OGNlMzUiLCJpYXQiOjE3Nzg0NTM5MjQsImV4cCI6MTc3ODU0MDMyNH0.uaYENOKHNN2Pp_jeK_R6zQ_MDUjhOfd8SAhpzIDUddg
```

---

## 📁 3. Exportação OpenAPI (swagger.json)

O arquivo `swagger.json` foi gerado automaticamente em: `apps/api/swagger.json`

### Importando no Insomnia:

1. Abrir o **Insomnia**
2. ir em **`Application > Preferences`**
3. Aba **`Data`** → **`Import Data`** → **`From File`**
4. Selecionar `swagger.json`
5. Todas as rotas são importadas automaticamente

---

## 🧠 4. Perguntas de Reflexão

### 4.1 O que o Swagger ajuda a resolver no ciclo de vida de uma API?

O Swagger (OpenAPI) automatiza a documentação da API, gerando uma interface interativa onde desenvolvedores podem testar endpoints diretamente. Isso elimina a necessidade de manter documentação manual, reduz erros de integração e facilita a comunicação entre equipes de frontend e backend.

### 4.2 Qual a função do `@ApiBearerAuth()`?

O decorator `@ApiBearerAuth()` indica ao Swagger que a rota requer autenticação via JWT Bearer token. Ele exibe o botão "Authorize" na interface, permitindo que o desenvolvedor insira o token uma vez e teste todas as rotas protegidas sem necessidade de incluir o header manualmente em cada requisição.

### 4.3 O que acontece se um campo do DTO não tiver `@ApiProperty()`?

O campo não aparecerá na documentação Swagger UI como um campo documentado. Embora ainda funcione corretamente (seja validado pelo class-validator), o Swagger não exibirá o campo na especificação OpenAPI, não mostrará um exemplo de valor na interface "Try it out", e o campo não terá documentação descritiva.

### 4.4 Quais são os benefícios de documentar status de erro (`@ApiResponse({ status: 400 })`)?

- **Clareza para frontend:** O desenvolvedor sabe exatamente qual erro esperar e pode implementar tratamentos específicos
- **Melhor experiência de uso:** Facilita o "Try it out" com mensagens de erro claras
- **Documentação automática:** Mantém a API autodocumentada sem esforço adicional
- **Validação de integrações:** Ferramentas como Insomnia/Postman podem validar automaticamente se a resposta corresponde à especificação

### 4.5 Como o Swagger pode ajudar em equipes com múltiplos desenvolvedores?

- **Contrato da API:** Serve como fonte única de verdade para todos os desenvolvedores
- ** onboarding:** Novos membros entendem a API rapidamente sem depender de outros
- **Paralelismo:** Equipes de frontend e backend podem trabalhar simultaneamente seguindo a especificação
- **Geração de código:** Ferramentas podem gerar clientes HTTP automaticamente
- **Testes automatizados:** Validação de compliance da API contra a especificação

---

## 📊 5. Endpoints Documentados

### Auth (`auth`)

| Método | Endpoint | Descrição | Autenticação |
|--------|-----------|------------|--------------|
| POST | `/auth/register` | Registra condomínio + admin | Não |
| POST | `/auth/login` | Login | Não |
| POST | `/auth/logout` | Logout | Sim (JWT) |

### Residents (`residents`)

| Método | Endpoint | Descrição | Autenticação |
|--------|-----------|------------|--------------|
| GET | `/residents` | Lista moradores | Admin |
| GET | `/residents/:id` | Busca morador | Admin |
| POST | `/residents` | Cadastra morador | Admin |
| PATCH | `/residents/:id/permissions` | Altera permissões | Admin |

### Common Areas (`common-areas`)

| Método | Endpoint | Descrição | Autenticação |
|--------|-----------|------------|--------------|
| GET | `/common-areas` | Lista áreas | Admin + Morador |
| GET | `/common-areas/:id` | Busca área | Admin + Morador |
| POST | `/common-areas` | Cria área | Admin |
| PATCH | `/common-areas/:id` | Atualiza área | Admin |
| DELETE | `/common-areas/:id` | Deleta área | Admin |

---

## 📝 6. Estrutura do Projeto

```
apps/api/
├── src/
│   ├── main.ts                          # Configuração Swagger
│   ├── auth/
│   │   ├── auth.controller.ts          # @ApiTags('auth')
│   │   └── dto/
│   │       ├── login.dto.ts             # @ApiProperty()
│   │       └── register-tenant.dto.ts   # @ApiProperty()
│   ├── residents/
│   │   └── residents.controller.ts     # @ApiTags('residents')
│   └── common-areas/
│       ├── common-areas.controller.ts  # @ApiTags('common-areas')
│       └── dto/
│           ├── create-common-area.dto.ts
│           └── update-common-area.dto.ts
└── swagger.json                        # Export OpenAPI (24KB)
```

---

## ✅ 7. Checklist de Entrega

- [x] Print da interface Swagger aberta (`/api/v1/docs`)
- [x] Endpoint público documentado (`/auth/login`)
- [x] Endpoint protegido com token (`/common-areas`)
- [x] DTO com `@ApiProperty()` aparecendo corretamente
- [x] Uso do botão "Authorize" com JWT
- [x] Perguntas de reflexão respondidas
- [x] Arquivo `swagger.json` exportado
