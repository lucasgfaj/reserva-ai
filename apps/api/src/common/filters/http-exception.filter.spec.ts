import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();
    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  function createMockHost(url: string = '/test', method: string = 'GET') {
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    return {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusMock, json: jsonMock }),
        getRequest: () => ({ url, method }),
      }),
      getResponse: () => ({ status: statusMock, json: jsonMock }),
    } as unknown as ArgumentsHost;
  }

  it('should return error response with status code and message', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    const host = createMockHost('/api/test');

    filter.catch(exception, host);

    const response = host.switchToHttp().getResponse() as any;
    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.status().json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        path: '/api/test',
      }),
    );
  });

  it('should return a well-formed error response', () => {
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    const host = createMockHost();

    filter.catch(exception, host);

    const response = host.switchToHttp().getResponse() as any;
    expect(response.status().json).toHaveBeenCalledWith({
      success: false,
      statusCode: 400,
      path: '/test',
      message: 'Bad Request',
    });
  });

  it('should handle BadRequestException', () => {
    const exception = new HttpException('Invalid data', HttpStatus.BAD_REQUEST);
    const host = createMockHost('/api/residents');

    filter.catch(exception, host);

    const response = host.switchToHttp().getResponse() as any;
    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should handle UnauthorizedException', () => {
    const exception = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const host = createMockHost();

    filter.catch(exception, host);

    const response = host.switchToHttp().getResponse() as any;
    expect(response.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
});