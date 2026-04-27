import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables before anything else
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('🚀 Reserva Aí! - API de Gestão Inteligente')
    .setDescription(
      '## 📝 Sobre o Projeto\n' +
        'O **Reserva Aí!** é uma solução completa em arquitetura de microsserviços (monorepo) para a modernização da gestão de condomínios. Esta API provê o núcleo lógico para o controle de áreas comuns, gestão de moradores e automação de processos administrativos.\n\n' +
        '### 🎯 Objetivos e Motivação\n' +
        'A API foi projetada para resolver problemas críticos de conflitos de agenda e falta de transparência na gestão de recursos compartilhados. Através desta interface, síndicos (Admins) podem gerenciar seu patrimônio e moradores (Residents) podem realizar agendamentos em tempo real.\n\n' +
        '### 🛠️ Guia de Uso\n' +
        '1. **Autenticação:** A maioria das rotas exige um Token Bearer (JWT) gerado no Login.\n' +
        '2. **Isolamento (Multi-tenant):** Segurança garantida através do isolamento lógico de dados por condomínio.\n' +
        '3. **Versionamento:** Estamos na **v1**, garantindo estabilidade para o consumo via Frontend VueJS.\n\n' +
        '---\n' +
        '*Desenvolvido em NestJS + Prisma ORM + PostgreSQL (Neon.tech)*',
    )
    .setVersion('1.0')
    .addTag('auth', 'Fluxos de Autenticação, Registro de Tenants e Sessão')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
