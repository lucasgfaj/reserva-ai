import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResidentValidationException } from '../exceptions/resident.exceptions';
import { validationExceptionFactory } from './validation-exception.factory';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const processedException = validationExceptionFactory(exception);

    if (processedException instanceof ResidentValidationException) {
      this.logger.warn(
        `[${request.method}] ${request.url} - [VALIDATION_FAILED] ${processedException.message}`,
      );

      response.status(status).json({
        statusCode: status,
        code: processedException.code,
        message: processedException.message,
        details: processedException.details,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    this.logger.warn(
      `[${request.method}] ${request.url} - [HTTP ${status}] ${exception.message}`,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      message: exception.message,
    });
  }
}