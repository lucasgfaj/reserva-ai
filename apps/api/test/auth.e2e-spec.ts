import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/auth/register (POST)', () => {
    const uniqueEmail = `admin${Date.now()}@reservaai.com.br`;
    const uniqueCondo = `Residencial ${Date.now()}`;

    const validPayload = {
      condominiumName: uniqueCondo,
      condominiumAddress: 'Rua das Flores, 123',
      adminName: 'Lucas Admin',
      adminEmail: uniqueEmail,
      adminPassword: 'Senha123!',
    };

    afterAll(async () => {
      try {
        await prisma.$transaction([
          prisma.reservationApproval.deleteMany({
            where: { approver: { email: uniqueEmail } },
          }),
          prisma.reservation.deleteMany({
            where: { commonArea: { condominium: { name: uniqueCondo } } },
          }),
          prisma.commonArea.deleteMany({
            where: { condominium: { name: uniqueCondo } },
          }),
          prisma.resident.deleteMany({
            where: { user: { email: uniqueEmail } },
          }),
          prisma.unit.deleteMany({
            where: { block: { condominium: { name: uniqueCondo } } },
          }),
          prisma.block.deleteMany({
            where: { condominium: { name: uniqueCondo } },
          }),
          prisma.user.deleteMany({
            where: { email: uniqueEmail },
          }),
          prisma.condominium.deleteMany({
            where: { name: uniqueCondo },
          }),
        ]);
      } catch {
        // Cleanup error ignored - best effort cleanup
      }
    });

    it('should return 201 when creating valid tenant and admin', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validPayload)
        .expect(201)
        .expect((res: { body: any }) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.user).toHaveProperty(
            'email',
            validPayload.adminEmail,
          );
          expect(res.body.condominium).toHaveProperty(
            'name',
            validPayload.condominiumName,
          );
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

    it('should return 400 when adminPassword missing special char', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...validPayload, adminPassword: 'Senha123' })
        .expect(400);
    });

    it('should return 400 when adminPassword missing number', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...validPayload, adminPassword: 'Senha!@#$' })
        .expect(400);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    const uniqueEmail = `login${Date.now()}@reservaai.com.br`;
    const uniqueCondo = `Condo Login ${Date.now()}`;
    const adminPassword = 'Senha123!';

    const registerPayload = {
      condominiumName: uniqueCondo,
      condominiumAddress: 'Rua Teste Login, 456',
      adminName: 'Admin Login',
      adminEmail: uniqueEmail,
      adminPassword,
    };

    const loginPayload = {
      email: uniqueEmail,
      password: adminPassword,
    };

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerPayload);
    });

    afterAll(async () => {
      try {
        await prisma.$transaction([
          prisma.reservationApproval.deleteMany({
            where: { approver: { email: uniqueEmail } },
          }),
          prisma.reservation.deleteMany({
            where: { commonArea: { condominium: { name: uniqueCondo } } },
          }),
          prisma.commonArea.deleteMany({
            where: { condominium: { name: uniqueCondo } },
          }),
          prisma.resident.deleteMany({
            where: { user: { email: uniqueEmail } },
          }),
          prisma.unit.deleteMany({
            where: { block: { condominium: { name: uniqueCondo } } },
          }),
          prisma.block.deleteMany({
            where: { condominium: { name: uniqueCondo } },
          }),
          prisma.user.deleteMany({
            where: { email: uniqueEmail },
          }),
          prisma.condominium.deleteMany({
            where: { name: uniqueCondo },
          }),
        ]);
      } catch {
        // ignore errors
      }
    });

    it('should return 200 and token when credentials are valid', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginPayload)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.user).toHaveProperty('email', uniqueEmail);
          expect(res.body.user).toHaveProperty('role', 'ADMIN');
          expect(res.body.condominium).toHaveProperty('name', uniqueCondo);
        });
    });

    it('should return 401 when email not found', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'naoexiste@teste.com', password: 'Senha123!' })
        .expect(401);
    });

    it('should return 401 when password is wrong', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: uniqueEmail, password: 'SenhaErrada!' })
        .expect(401);
    });

    it('should return 400 when email is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ password: 'Senha123!' })
        .expect(400);
    });

    it('should return 400 when password is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: uniqueEmail })
        .expect(400);
    });
  });
});
