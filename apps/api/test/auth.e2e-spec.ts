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
      } catch (e) {}
    });

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
});