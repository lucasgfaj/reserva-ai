import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException } from '@nestjs/common';
import cookieParser from 'cookie-parser';

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

  await app.init();

  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  cachedApp(req, res);
}
