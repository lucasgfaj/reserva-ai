import { HttpException, HttpStatus } from '@nestjs/common';
import { ResidentValidationException } from '../exceptions/resident.exceptions';

interface ExceptionResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export function validationExceptionFactory(
  exception: HttpException,
): ResidentValidationException | HttpException {
  const response = exception.getResponse() as ExceptionResponse;

  if (Array.isArray(response.message)) {
    return new ResidentValidationException(response.message);
  }

  return exception;
}
