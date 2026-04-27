import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/auth/register (POST)', () => {
    const validPayload = {
      condominiumName: 'Residencial Horizonte',
      condominiumAddress: 'Rua das Flores, 123',
      adminName: 'Lucas Admin',
      adminEmail: `admin${Date.now()}@reservaai.com.br`,
      adminPassword: 'SenhaSegura123',
    };

    it('should return 201 when creating valid tenant and admin', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validPayload)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.user).toHaveProperty('email', validPayload.adminEmail);
          expect(res.body.condominium).toHaveProperty('name', validPayload.condominiumName);
        });
    });

    it('should return 400 when missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({})
        .expect(400);
    });

    it('should return 400 when adminEmail is invalid', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...validPayload, adminEmail: 'invalid-email' })
        .expect(400);
    });

    it('should return 400 when adminPassword is too short', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...validPayload, adminPassword: '123' })
        .expect(400);
    });
  });
});