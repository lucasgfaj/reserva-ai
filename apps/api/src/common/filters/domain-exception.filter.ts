import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions/resident.exceptions';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    this.logger.warn(
      `[${request.method}] ${request.url} - [${exception.code}] ${exception.message}`,
    );

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
      details: exception.details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
