import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from '../dist/src/app.module';
import { HttpExceptionFilter } from '../dist/src/common/filters/http-exception.filter';
import { DomainExceptionFilter } from '../dist/src/common/filters/domain-exception.filter';

let cachedApp: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) =>
          Object.values(error.constraints || {}).join(', '),
        );
        return new HttpException(
          {
            statusCode: 400,
            code: 'VALIDATION_FAILED',
            message: messages.join('; '),
            details: errors.map((e) => ({
              field: e.property,
              errors: Object.values(e.constraints || {}),
            })),
          },
          400,
        );
      },
    }),
  );

  app.useGlobalFilters(new DomainExceptionFilter(), new HttpExceptionFilter());

  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174'];

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('🚀 Reserva Aí! - API de Gestão de Condomínios')
    .setDescription(
      '## 📝 Sobre o Projeto\n' +
        'O **Reserva Aí!** é uma solução completa para a modernização da gestão de condomínios.\n\n' +
        '### 🛠️ Guia de Uso\n' +
        '1. **Autenticação:** Após login, use o token JWT no header Authorization: `Bearer <token>`\n' +
        '2. **Isolamento (Multi-tenant):** Dados isolados por condomínio (RN01)\n' +
        '3. **Roles:** ADMIN (administrador), RESIDENT (morador), SUPER_ADMIN\n\n' +
        '### 🔐 Segurança e Permissões\n' +
        '| Role | Acesso |\n' +
        '|------|--------|\n' +
        '| ADMIN | CRUD completo: condomínio, moradores e áreas |\n' +
        '| RESIDENT | READ: áreas comuns; BOOK: reservas |\n' +
        '| SUPER_ADMIN | Global (sem condomínio vinculado) |\n\n' +
        '### 📋 User Stories Implementadas\n' +
        '| US | Descrição |\n' +
        '|----|----------|\n' +
        '| US01 | Criar conta e registrar condomínio |\n' +
        '| US02 | Login e gerenciar dados do condomínio |\n' +
        '| US03 | Cadastrar e gerenciar moradores (Admin) |\n' +
        '| US03.1 | Login de morador |\n' +
        '| US04 | Cadastrar e gerenciar áreas comuns (Admin) |\n' +
        '| US05 | Visualizar áreas comuns |\n' +
        '| US06 | Consultar disponibilidade de áreas comuns |\n' +
        '| US07 | Realizar reserva de área comum |\n' +
        '| US08 | Cancelar reserva |\n' +
        '| US09/US10 | Listar reservas (Admin e Morador) |\n' +
        '| US11 | Aprovar/Rejeitar reserva (Admin) |\n' +
        '| - | Comunicados (Admin criar/remover, todos visualizar) |\n\n' +
        '*Desenvolvido em NestJS + Prisma ORM + PostgreSQL*',
    )
    .setVersion('1.0')
    .addTag('auth', 'US01, US02, US03.1 - Autenticação e Registro')
    .addTag('residents', 'US03 - Gestão de Moradores (Admin only)')
    .addTag('condominiums', 'US02 - Gestão do Condomínio')
    .addTag('common-areas', 'US04, US05, US06 - Áreas Comuns')
    .addTag('reservations', 'US07, US08, US09, US10, US11 - Reservas')
    .addTag('announcements', 'Comunicados do Condomínio')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Cole o token JWT retornado no login',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/api/v1/docs-json', (_req: any, res: any) => res.json(document));
  expressApp.get('/api/v1/docs', (_req: any, res: any) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Reserva Aí! - API Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <style>html { box-sizing: border-box; overflow-y: scroll; } body { margin: 0; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/v1/docs-json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: 'StandaloneLayout',
    });
  </script>
</body>
</html>`);
  });

  await app.init();

  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    try {
      cachedApp = await bootstrap();
    } catch (err: any) {
      console.error('[Vercel] Bootstrap failed:', err);
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error: process.env.VERCEL_ENV === 'development' ? err.message : undefined,
      });
      return;
    }
  }
  cachedApp(req, res);
}
