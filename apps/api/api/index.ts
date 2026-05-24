import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import serverless from 'serverless-http';

import { HttpExceptionFilter } from '../dist/src/common/filters/http-exception.filter.js';
import { DomainExceptionFilter } from '../dist/src/common/filters/domain-exception.filter.js';
import { AppModule } from '../dist/src/app.module.js';

let cachedApp;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          return Object.values(error.constraints || {}).join(', ');
        });
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
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  });
  await app.init();
  return app;
}

export const handler = serverless(async (req, res) => {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  const expressInstance = cachedApp.getHttpAdapter().getInstance();
  return expressInstance(req, res);
});
