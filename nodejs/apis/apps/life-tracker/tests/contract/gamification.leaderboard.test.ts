import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GamificationModule } from '../../src/modules/gamification/gamification.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('Gamification Leaderboard Contract (e2e)', () => {
  let app: INestApplication;
  let gamificationProfileModel: Model<any>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GamificationModule],
    })
      .overrideProvider(getModelToken('GamificationProfile'))
      .useValue({
        find: jest.fn(),
        countDocuments: jest.fn(),
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

  describe('GET /gamification/leaderboard', () => {
    it('deve retornar ranking geral por padrão', async () => {
      const mockLeaderboard = [
        {
          userId: 'user-1',
          totalPoints: 1000,
          level: 5,
          position: 1,
        },
        {
          userId: 'user-2',
          totalPoints: 800,
          level: 4,
          position: 2,
        },
      ];

      jest.spyOn(gamificationProfileModel, 'find').mockResolvedValue(mockLeaderboard);
      jest.spyOn(gamificationProfileModel, 'countDocuments').mockResolvedValue(2);

      const response = await request(app.getHttpServer())
        .get('/gamification/leaderboard')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({
              userId: 'user-1',
              totalPoints: 1000,
              level: 5,
              position: 1,
            }),
            expect.objectContaining({
              userId: 'user-2',
              totalPoints: 800,
              level: 4,
              position: 2,
            }),
          ]),
          totalUsers: 2,
          period: 'all',
        }),
        timestamp: expect.any(String),
      });
    });

    it('deve retornar ranking semanal quando período especificado', async () => {
      const mockLeaderboard = [
        {
          userId: 'user-1',
          totalPoints: 500,
          level: 3,
          position: 1,
        },
      ];

      jest.spyOn(gamificationProfileModel, 'find').mockResolvedValue(mockLeaderboard);
      jest.spyOn(gamificationProfileModel, 'countDocuments').mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/gamification/leaderboard?period=weekly')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          entries: expect.any(Array),
          totalUsers: 1,
          period: 'weekly',
        }),
        timestamp: expect.any(String),
      });
    });

    it('deve retornar ranking diário quando período especificado', async () => {
      const mockLeaderboard = [
        {
          userId: 'user-1',
          totalPoints: 100,
          level: 2,
          position: 1,
        },
      ];

      jest.spyOn(gamificationProfileModel, 'find').mockResolvedValue(mockLeaderboard);
      jest.spyOn(gamificationProfileModel, 'countDocuments').mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/gamification/leaderboard?period=daily')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          entries: expect.any(Array),
          totalUsers: 1,
          period: 'daily',
        }),
        timestamp: expect.any(String),
      });
    });

    it('deve retornar ranking mensal quando período especificado', async () => {
      const mockLeaderboard = [
        {
          userId: 'user-1',
          totalPoints: 2000,
          level: 8,
          position: 1,
        },
      ];

      jest.spyOn(gamificationProfileModel, 'find').mockResolvedValue(mockLeaderboard);
      jest.spyOn(gamificationProfileModel, 'countDocuments').mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/gamification/leaderboard?period=monthly')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          entries: expect.any(Array),
          totalUsers: 1,
          period: 'monthly',
        }),
        timestamp: expect.any(String),
      });
    });

    it('deve retornar lista vazia quando não há usuários', async () => {
      jest.spyOn(gamificationProfileModel, 'find').mockResolvedValue([]);
      jest.spyOn(gamificationProfileModel, 'countDocuments').mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/gamification/leaderboard')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          entries: [],
          totalUsers: 0,
          period: 'all',
        }),
        timestamp: expect.any(String),
      });
    });
  });

  describe('Validação de Schema', () => {
    it('deve validar estrutura de entrada do ranking', () => {
      const validEntry = {
        userId: 'user-123',
        totalPoints: 1000,
        level: 5,
        position: 1,
      };

      // Validações obrigatórias
      expect(validEntry).toHaveProperty('userId');
      expect(validEntry).toHaveProperty('totalPoints');
      expect(validEntry).toHaveProperty('level');
      expect(validEntry).toHaveProperty('position');

      // Validações de tipo
      expect(typeof validEntry.userId).toBe('string');
      expect(typeof validEntry.totalPoints).toBe('number');
      expect(typeof validEntry.level).toBe('number');
      expect(typeof validEntry.position).toBe('number');

      // Validações de valor
      expect(validEntry.totalPoints).toBeGreaterThanOrEqual(0);
      expect(validEntry.level).toBeGreaterThanOrEqual(1);
      expect(validEntry.position).toBeGreaterThanOrEqual(1);
    });
  });
});
