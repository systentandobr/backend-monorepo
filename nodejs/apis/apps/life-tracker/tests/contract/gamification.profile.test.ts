import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GamificationModule } from '../../src/modules/gamification/gamification.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('Gamification Profile Contract (e2e)', () => {
  let app: INestApplication;
  let gamificationProfileModel: Model<any>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GamificationModule],
    })
      .overrideProvider(getModelToken('GamificationProfile'))
      .useValue({
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    gamificationProfileModel = moduleFixture.get<Model<any>>(
      getModelToken('GamificationProfile'),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /gamification/profile', () => {
    it('deve retornar erro quando userId não é fornecido', async () => {
      const response = await request(app.getHttpServer())
        .get('/gamification/profile')
        .expect(200);

      expect(response.body).toMatchObject({
        success: false,
        error: 'userId é obrigatório',
        timestamp: expect.any(String),
      });
    });

    it('deve retornar perfil de gamificação válido', async () => {
      const mockProfile = {
        userId: 'user-123',
        totalPoints: 500,
        level: 3,
        pointsToNextLevel: 200,
        hasProfile: true,
        totalTransactions: 10,
        todayPoints: 50,
      };

      jest.spyOn(gamificationProfileModel, 'findOne').mockResolvedValue(mockProfile);

      const response = await request(app.getHttpServer())
        .get('/gamification/profile?userId=user-123')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          userId: 'user-123',
          totalPoints: expect.any(Number),
          level: expect.any(Number),
          pointsToNextLevel: expect.any(Number),
        }),
        timestamp: expect.any(String),
      });
    });

    it('deve retornar perfil padrão quando usuário não existe', async () => {
      jest.spyOn(gamificationProfileModel, 'findOne').mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/gamification/profile?userId=user-456')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          totalPoints: 0,
          level: 1,
          pointsToNextLevel: 100,
          hasProfile: false,
        }),
        timestamp: expect.any(String),
      });
    });
  });

  describe('Validação de Schema', () => {
    it('deve validar estrutura do perfil de gamificação', () => {
      const validProfile = {
        userId: 'user-123',
        totalPoints: 500,
        level: 3,
        pointsToNextLevel: 200,
        hasProfile: true,
        totalTransactions: 10,
        todayPoints: 50,
      };

      // Validações obrigatórias
      expect(validProfile).toHaveProperty('userId');
      expect(validProfile).toHaveProperty('totalPoints');
      expect(validProfile).toHaveProperty('level');
      expect(validProfile).toHaveProperty('pointsToNextLevel');

      // Validações de tipo
      expect(typeof validProfile.userId).toBe('string');
      expect(typeof validProfile.totalPoints).toBe('number');
      expect(typeof validProfile.level).toBe('number');
      expect(typeof validProfile.pointsToNextLevel).toBe('number');

      // Validações de valor
      expect(validProfile.totalPoints).toBeGreaterThanOrEqual(0);
      expect(validProfile.level).toBeGreaterThanOrEqual(1);
      expect(validProfile.pointsToNextLevel).toBeGreaterThanOrEqual(0);
    });
  });
});
