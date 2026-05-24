import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import serverless from 'serverless-http';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

let cachedServer;

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
          Object.values(error.constraints || {}).join(', ')
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

  app.useGlobalFilters(
    new DomainExceptionFilter(),
    new HttpExceptionFilter(),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Reserva Aí API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(
    'api/v1/docs',
    app,
    document,
  );

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();

  return serverless(expressApp);
}

export const handler = async (req, res) => {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }

  return cachedServer(req, res);
};