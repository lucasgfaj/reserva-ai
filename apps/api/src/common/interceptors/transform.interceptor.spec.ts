import { Test, TestingModule } from '@nestjs/testing';
import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformInterceptor],
    }).compile();
    interceptor = module.get<TransformInterceptor>(TransformInterceptor);
  });

  function mockContext() {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ url: '/test', method: 'GET' }),
      }),
    } as ExecutionContext;
  }

  it('should wrap response with success, timestamp, and data', (done) => {
    const mockNext = { handle: () => of({ id: '1', name: 'test' }) } as CallHandler;

    interceptor.intercept(mockContext(), mockNext).subscribe((result) => {
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual({ id: '1', name: 'test' });
      done();
    });
  });

  it('should wrap array response correctly', (done) => {
    const items = [{ id: '1' }, { id: '2' }];
    const mockNext = { handle: () => of(items) } as CallHandler;

    interceptor.intercept(mockContext(), mockNext).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      done();
    });
  });

  it('should wrap null response correctly', (done) => {
    const mockNext = { handle: () => of(null) } as CallHandler;

    interceptor.intercept(mockContext(), mockNext).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      done();
    });
  });

  it('should generate a valid ISO timestamp', (done) => {
    const mockNext = { handle: () => of({}) } as CallHandler;

    interceptor.intercept(mockContext(), mockNext).subscribe((result) => {
      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
      done();
    });
  });
});