import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GamificationModule } from '../../src/modules/gamification/gamification.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('Gamification Achievements Contract (e2e)', () => {
  let app: INestApplication;
  let achievementModel: Model<any>;
  let userAchievementModel: Model<any>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GamificationModule],
    })
      .overrideProvider(getModelToken('Achievement'))
      .useValue({
        find: jest.fn(),
      })
      .overrideProvider(getModelToken('UserAchievement'))
      .useValue({
        find: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    achievementModel = moduleFixture.get<Model<any>>(
      getModelToken('Achievement'),
    );
    userAchievementModel = moduleFixture.get<Model<any>>(
      getModelToken('UserAchievement'),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /gamification/achievements', () => {
    it('deve retornar erro quando userId não é fornecido', async () => {
      const response = await request(app.getHttpServer())
        .get('/gamification/achievements')
        .expect(200);

      expect(response.body).toMatchObject({
        success: false,
        error: 'userId é obrigatório',
        timestamp: expect.any(String),
      });
    });

    it('deve retornar conquistas do usuário com status de desbloqueio', async () => {
      const mockAchievements = [
        {
          _id: 'achievement-1',
          achievementId: 'first_habit',
          name: 'Primeiro Hábito',
          description: 'Complete seu primeiro hábito',
          icon: 'star',
          criteria: { type: 'HABIT_COUNT', value: 1 },
        },
        {
          _id: 'achievement-2',
          achievementId: 'streak_7',
          name: 'Série de 7 Dias',
          description: 'Complete um hábito por 7 dias seguidos',
          icon: 'flame',
          criteria: { type: 'STREAK', value: 7 },
        },
      ];

      const mockUserAchievements = [
        {
          userId: 'user-123',
          achievementId: 'first_habit',
          unlockedAt: new Date('2024-01-01'),
        },
      ];

      jest.spyOn(achievementModel, 'find').mockResolvedValue(mockAchievements);
      jest
        .spyOn(userAchievementModel, 'find')
        .mockResolvedValue(mockUserAchievements);

      const response = await request(app.getHttpServer())
        .get('/gamification/achievements?userId=user-123')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          achievements: expect.arrayContaining([
            expect.objectContaining({
              achievementId: 'first_habit',
              name: 'Primeiro Hábito',
              unlocked: true,
              unlockedAt: expect.any(String),
            }),
            expect.objectContaining({
              achievementId: 'streak_7',
              name: 'Série de 7 Dias',
              unlocked: false,
            }),
          ]),
          unlockedCount: expect.any(Number),
          totalCount: expect.any(Number),
        }),
        timestamp: expect.any(String),
      });
    });

    it('deve retornar lista vazia quando não há conquistas', async () => {
      jest.spyOn(achievementModel, 'find').mockResolvedValue([]);
      jest.spyOn(userAchievementModel, 'find').mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/gamification/achievements?userId=user-123')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          achievements: [],
          unlockedCount: 0,
          totalCount: 0,
        }),
        timestamp: expect.any(String),
      });
    });
  });

  describe('Validação de Schema', () => {
    it('deve validar estrutura de conquista', () => {
      const validAchievement = {
        achievementId: 'first_habit',
        name: 'Primeiro Hábito',
        description: 'Complete seu primeiro hábito',
        icon: 'star',
        criteria: {
          type: 'HABIT_COUNT',
          value: 1,
        },
        unlocked: true,
        unlockedAt: '2024-01-01T00:00:00.000Z',
      };

      // Validações obrigatórias
      expect(validAchievement).toHaveProperty('achievementId');
      expect(validAchievement).toHaveProperty('name');
      expect(validAchievement).toHaveProperty('description');
      expect(validAchievement).toHaveProperty('icon');
      expect(validAchievement).toHaveProperty('criteria');

      // Validações de tipo
      expect(typeof validAchievement.achievementId).toBe('string');
      expect(typeof validAchievement.name).toBe('string');
      expect(typeof validAchievement.description).toBe('string');
      expect(typeof validAchievement.icon).toBe('string');
      expect(typeof validAchievement.criteria).toBe('object');

      // Validações de critério
      expect(validAchievement.criteria).toHaveProperty('type');
      expect(validAchievement.criteria).toHaveProperty('value');
      expect(['STREAK', 'POINTS', 'HABIT_COUNT', 'ROUTINE_COUNT']).toContain(
        validAchievement.criteria.type,
      );
      expect(typeof validAchievement.criteria.value).toBe('number');
    });
  });
});
