# Reserva Aí! - Contexto do Projeto

## Propósito
Plataforma web para gestão de reservas de áreas comuns em condomínios. Moradores reservam espaços como salão de festas, churrasqueira, piscina; administradores gerenciam condomínio, moradores, áreas e aprovam/rejeitam reservas.

## Tech Stack
- **Monorepo:** NPM Workspaces (`apps/*`)
- **Backend:** NestJS 11 + Prisma ORM 7 + PostgreSQL (Neon)
- **Frontend:** Vue 3 (Composition API, `<script setup>`) + Vite
- **Auth:** JWT (1d expiry) + HttpOnly cookie + Bearer header
- **Validação:** class-validator + class-transformer + ValidationPipe (whitelist)
- **Documentação:** @nestjs/swagger em `/api/v1/docs`

## Metodologia: TDD (Test-Driven Development)
**Sempre construir código para passar no teste primeiro.** O fluxo de desenvolvimento segue TDD (Red-Green-Refactor):

1. **Escreva o teste** (Red) - o teste falha pois a funcionalidade não existe
2. **Implemente o código mínimo** (Green) - código apenas para passar no teste
3. **Refatore** (Refactor) - melhore sem quebrar o teste

Isso se aplica tanto ao **backend** (`npm run dev:api:test`) quanto ao **frontend** (`npm run dev:web:test`).

Workflows de desenvolvimento disponíveis em `.agents/workflows/`:
- `tdd-worker.md` - Pipeline TDD automatizado (4 fases: Data → Backend → UI → Frontend)
- `tdd-worker-didatico.md` - Versão didática com explicações passo a passo
- `sdd-architect.md` - Spec-Driven Development (gerar critérios de aceitação antes do código)

Skills especializadas disponíveis em `.agents/skills/`: nestjs-expert, prisma-expert, postgresql, vue-best-practices, vue-testing-best-practices, vue-router-best-practices, vue-pinia-best-practices, vue-debug-guides, neon-postgres, create-adaptable-composable, vue-jsx-best-practices, vue-options-api-best-practices.

## Estrutura

### `apps/api` - Backend NestJS
```
src/
├── auth/          # Login, register, JWT guards, cookie utils, validators
├── common/        # Filters (DomainException, HttpException), interceptors, exceptions
├── condominiums/  # CRUD do condomínio do admin logado
├── residents/     # CRUD de moradores (admin only), validators
├── common-areas/  # CRUD áreas comuns, availability, busy-days, closed-dates, validators
├── reservations/  # CRUD reservas, approve, reject, cancel
├── announcements/ # CRUD comunicados
├── prisma/        # PrismaService (singleton, Pool pg max 5, statement_timeout 30s)
├── logger/        # LoggerMiddleware (console + log file)
├── types/         # Tipos globais (Role enum, Express Request com user)
└── main.ts        # Bootstrap, Swagger, CORS, ValidationPipe global, timeout 25s
```

**Módulos:** auth, users, residents, condominiums, common-areas, reservations, announcements
**Serviços principais:** PrismaService, AuthService, UsersService, ResidentsService, CondominiumsService, CommonAreasService, ReservationsService, ReservationApprovalsService, AnnouncementsService
**Guards:** JwtAuthGuard (cookie `access_token` primeiro, depois Bearer header), RolesGuard (ADMIN/RESIDENT/SUPER_ADMIN)
**Context pattern:** `ServiceContext { role, condominiumId, userId }` passado manualmente do controller ao service
**Paginação:** Todos os endpoints de lista suportam `?page=&limit=` (default page=1, limit=10, announcements limit=20)
**Validação extra:** Validators dedicados (RegisterTenantValidator, LoginValidator, CreateResidentValidator, CreateCommonAreaValidator) complementam os DTOs

### `apps/web` - Frontend Vue 3
```
src/
├── api/           # Axios instance (http.ts) com interceptors (token, retry com backoff, 401 redirect)
├── modules/
│   ├── auth/      # Login, register, auth service (localStorage), rotas
│   ├── admin/     # Dashboard admin, CRUD áreas, moradores, comunicados
│   ├── resident/  # Dashboard morador, reservas
│   ├── landing/   # Landing page
│   └── shared/    # Composables (useLoading, useToast, useSidebar, useUserRole, useApiError), NotFoundPage
├── router/        # Vue Router (guards por auth token e role, XSS protection no path)
├── store/         # Vazio - estado via localStorage + composables singleton
└── utils/         # Helpers
```

**Estado:** localStorage (`auth_token`, `auth_user`, `auth_condo`) lido pelo `AuthService` singleton. Composables com `ref` module-level para loading/toast/sidebar. Sem Pinia/Vuex.
**HTTP interceptor:** Retry automático (2 tentativas, exponential backoff 1s-4s) para status retryable (0, 408, 429, 500, 502, 503, 504). Redireciona para `/login` em 401.

## Modelo de Dados (Prisma)
- **User** (id, name, email, passwordHash, provider[LOCAL,GOOGLE], role[SUPER_ADMIN,ADMIN,RESIDENT], condominiumId, isActive)
- **Condominium** (id, name, address, timezone)
- **Block** (id, name, condominiumId) - sem endpoints REST
- **Unit** (id, number, blockId) - sem endpoints REST
- **Resident** (id, userId[unique], unitId, document, phone, canBook)
- **CommonArea** (id, name, description, capacity, openTime, closeTime, operatingDays[JSON], closedDates[JSON], requiresApproval, icon, isUnderMaintenance[default false], condominiumId)
- **Reservation** (id, residentId, commonAreaId, startTime, endTime, status[PENDING,APPROVED,REJECTED,CANCELED], notes, canceledById, canceledAt)
- **ReservationApproval** (id, reservationId, approvedBy, approvedAt, status[APPROVED,REJECTED], comment)
- **Announcement** (id, title, content, condominiumId, authorId, isActive[default true])

## Regras de Negócio (RNs)
- RN01: Isolamento multi-tenant por `condominiumId` em todas as queries. SUPER_ADMIN não tem condomínio vinculado - acesso negado a recursos tenant-scoped.
- RN01.1: Moradores não têm cadastro público - criados apenas por admin (POST /residents gera JWT + senha temporária para o morador).
- RN02: Criação de condomínio + admin raiz em transação única (`POST /auth/register`)
- RN03: Sem conflito de horário na mesma área; duração mínima 2h (120 min)
- RN03.1: Cada área tem horário de funcionamento, dias operacionais e capacidade validados
- RN03.2: Duração mínima de 2 horas (startTime < endTime, diff >= 120 min)
- RN03.3: `requiresApproval=true` → status `PENDING`; senão `APPROVED`
- RN03.4: `closedDates` bloqueiam reservas na data; busy-days mescla reservas + closedDates
- RN03.5: `isUnderMaintenance=true` bloqueia todas as reservas da área
- RN04: Cancelamento é soft delete (status CANCELED, registra canceledById, canceledAt). Autor da reserva ou admin podem cancelar.
- RN05: Aprovação/rejeição exclusiva de admin do mesmo condomínio, registrado em `reservation_approvals` (via `$transaction`).
- RN06: Admin pode criar reserva em nome de morador (`residentId` opcional no CreateReservationDto).
- RN07: Exclusão de área comum bloqueada se houver reservas PENDING ou APPROVED ativas.
- RN08: Comunicados têm soft-delete (isActive=false), não exclusão física.

## Endpoints da API (`/api/v1`)
### Auth
- `POST /auth/register` - Cria condomínio + admin (RegisterTenantDTO)
- `POST /auth/login` - Login (retorna JWT + user + condominium)
- `POST /auth/logout`
- `PATCH /auth/me` - Atualizar perfil
- `POST /auth/change-password`

### Condominiums
- `GET /condominiums` - Dados do condomínio do admin logado
- `PATCH /condominiums`

### Residents
- `POST /residents` - Admin cria morador (retorna JWT + temp password)
- `GET /residents` - Listar (query: page, limit)
- `GET /residents/:id`
- `PATCH /residents/:id/permissions` - Alterar `canBook`

### Common Areas
- `POST /common-areas` - Admin
- `GET /common-areas` (query: page, limit)
- `GET /common-areas/:id`
- `GET /common-areas/:id/availability?date=YYYY-MM-DD&startTime=&endTime=`
- `GET /common-areas/:id/busy-days?year=&month=`
- `PATCH /common-areas/:id` - Admin
- `DELETE /common-areas/:id` - Admin (bloqueado se há reservas ativas)
- `POST /common-areas/:id/closed-dates` - Admin
- `DELETE /common-areas/:id/closed-dates` - Admin

### Reservations
- `POST /reservations` (body: commonAreaId, date, startTime, endTime, notes?, residentId? [admin only])
- `GET /reservations?status=&from=&to=&page=&limit=` (RESIDENT vê próprias; ADMIN vê todas do condomínio)
- `PATCH /reservations/:id/cancel`
- `PATCH /reservations/:id/approve` (Admin, via $transaction)
- `PATCH /reservations/:id/reject` (Admin, via $transaction)

### Announcements
- `POST /announcements` (Admin)
- `GET /announcements` (query: page, limit)
- `DELETE /announcements/:id` (Admin, soft-delete isActive=false)

## Comandos
```bash
npm run dev:api          # Iniciar backend
npm run dev:web          # Iniciar frontend
npm run dev:prisma       # Gerar Prisma client + deploy migrations
npm run dev:prisma:seed  # Idem + seed
npm run dev:prisma:studio # Prisma Studio (porta 5555)
npm run dev:api:test     # Testes unitários backend (~20 spec files)
npm run dev:api:test:e2e # Testes E2E backend (auth flow)
npm run dev:api:test:cover # Testes com cobertura
npm run dev:web:test     # Testes frontend
```

## Padrões de Código
- **NestJS:** modular (`@Module`), controllers injetam services, guards aplicados por rota. TransformInterceptor aplicado por controller (não global). DomainExceptionFilter + HttpExceptionFilter globais.
- **Vue 3:** Composition API com `<script setup>`, módulos por domínio, Axios via `http.ts`
- **Auth:** token em localStorage no frontend; JWT em cookie + header no backend (cookie tem prioridade)
- **Erros (sucesso):** `TransformInterceptor` → `{ success: true, timestamp, data }`
- **Erros (DomainException):** `{ statusCode, code, message, details, timestamp, path }` (sem `success`)
- **Erros (HttpException):** `{ success: false, statusCode, path, message }`
- **Erros (Validation):** `{ statusCode, code: 'VALIDATION_FAILED', message, details[] }`
- **Prisma:** `PrismaPg` adapter com `Pool` (max 5), `statement_timeout = 30000`
- **Timeout:** Middleware 25s → HTTP 408
- **DomainExceptions:** 19 classes de exceção de domínio em 4 arquivos (resident, condominium, common-area, reservation)
- **Testes:** 20 unit spec files + 2 e2e spec files. Setup global mock para bcrypt.hash.

## Observações Técnicas
- Anúncios sem endpoint de edição (apenas criar e deletar)
- `Provider.GOOGLE` existe no schema mas não há implementação de OAuth Google
- Rotas de Block e Unit existem no Prisma mas não têm endpoints REST
- Swagger JSON exportado para `swagger.json` na inicialização
- `POST /residents` gera senha temporária automaticamente se não fornecida
- Aprovação/rejeição de reserva usa `$transaction` (atualiza status + cria reservation_approval atomicamente)
- Delete de common-area verifica reservas com status PENDING ou APPROVED
