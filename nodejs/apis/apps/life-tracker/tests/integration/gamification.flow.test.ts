import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as request from 'supertest';
import { GamificationModule } from '../../src/modules/gamification/gamification.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('Gamification Flow Integration (e2e)', () => {
  let app: INestApplication;
  let eventEmitter: EventEmitter2;
  let gamificationProfileModel: Model<any>;
  let pointTransactionModel: Model<any>;
  let achievementModel: Model<any>;
  let userAchievementModel: Model<any>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GamificationModule],
    })
      .overrideProvider(getModelToken('GamificationProfile'))
      .useValue({
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        countDocuments: jest.fn(),
      })
      .overrideProvider(getModelToken('PointTransaction'))
      .useValue({
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        countDocuments: jest.fn(),
      })
      .overrideProvider(getModelToken('Achievement'))
      .useValue({
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      })
      .overrideProvider(getModelToken('UserAchievement'))
      .useValue({
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    eventEmitter = moduleFixture.get<EventEmitter2>(EventEmitter2);
    gamificationProfileModel = moduleFixture.get<Model<any>>(
      getModelToken('GamificationProfile'),
    );
    pointTransactionModel = moduleFixture.get<Model<any>>(
      getModelToken('PointTransaction'),
    );
    achievementModel = moduleFixture.get<Model<any>>(getModelToken('Achievement'));
    userAchievementModel = moduleFixture.get<Model<any>>(
      getModelToken('UserAchievement'),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Fluxo Completo de Gamificação', () => {
    it('deve processar evento de hábito completado e adicionar pontos', async () => {
      const userId = 'user-123';
      const habitId = 'habit-456';
      const habitName = 'Beber água';

      // Mock do perfil existente
      const mockProfile = {
        userId,
        totalPoints: 100,
        level: 2,
        pointsToNextLevel: 50,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(gamificationProfileModel, 'findOne').mockResolvedValue(mockProfile);

      // Mock da transação
      const mockTransaction = {
        userId,
        points: 15, // 10 * 1.5 (medium difficulty)
        sourceType: 'HABIT_COMPLETION',
        sourceId: habitId,
        description: `Completou o hábito: ${habitName}`,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(pointTransactionModel, 'create').mockReturnValue(mockTransaction);

      // Mock das conquistas
      const mockAchievements = [
        {
          achievementId: 'first_habit',
          name: 'Primeiro Hábito',
          criteria: { type: 'HABIT_COUNT', value: 1 },
        },
      ];

      jest.spyOn(achievementModel, 'find').mockResolvedValue(mockAchievements);
      jest.spyOn(userAchievementModel, 'find').mockResolvedValue([]);

      // Emitir evento de hábito completado
      eventEmitter.emit('habit.completed', {
        userId,
        habitId,
        difficulty: 'medium',
        habitName,
      });

      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verificar se o perfil foi atualizado
      expect(mockProfile.save).toHaveBeenCalled();
      expect(mockProfile.totalPoints).toBe(115); // 100 + 15

      // Verificar se a transação foi criada
      expect(pointTransactionModel.create).toHaveBeenCalledWith({
        userId,
        points: 15,
        sourceType: 'HABIT_COMPLETION',
        sourceId: habitId,
        description: `Completou o hábito: ${habitName}`,
      });
    });

    it('deve adicionar pontos via endpoint POST /gamification/transaction', async () => {
      const transactionData = {
        userId: 'user-123',
        points: 25,
        sourceType: 'ROUTINE_COMPLETION',
        sourceId: 'routine-789',
        description: 'Completou a rotina: Exercícios matinais',
      };

      const mockProfile = {
        userId: 'user-123',
        totalPoints: 200,
        level: 3,
        pointsToNextLevel: 100,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(gamificationProfileModel, 'findOne').mockResolvedValue(mockProfile);

      const mockTransaction = {
        userId: 'user-123',
        points: 25,
        sourceType: 'ROUTINE_COMPLETION',
        sourceId: 'routine-789',
        description: 'Completou a rotina: Exercícios matinais',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(pointTransactionModel, 'create').mockReturnValue(mockTransaction);

      const response = await request(app.getHttpServer())
        .post('/gamification/transaction')
        .send(transactionData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          profile: expect.any(Object),
          transaction: expect.any(Object),
        }),
        timestamp: expect.any(String),
      });
    });

    it('deve retornar erro quando dados obrigatórios não são fornecidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/gamification/transaction')
        .send({
          userId: 'user-123',
          // Faltando campos obrigatórios
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Todos os campos são obrigatórios',
        timestamp: expect.any(String),
      });
    });

    it('deve inicializar conquistas padrão', async () => {
      const mockAchievements = [
        {
          achievementId: 'first_habit',
          name: 'Primeiro Hábito',
          description: 'Complete seu primeiro hábito',
          icon: 'star',
          criteria: { type: 'HABIT_COUNT', value: 1 },
        },
      ];

      jest.spyOn(achievementModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(achievementModel, 'create').mockReturnValue({
        save: jest.fn().mockResolvedValue(mockAchievements[0]),
      });

      const response = await request(app.getHttpServer())
        .post('/gamification/initialize-achievements')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        timestamp: expect.any(String),
      });
    });
  });

  describe('Validação de Integração', () => {
    it('deve manter consistência entre perfil e transações', async () => {
      const userId = 'user-123';
      const initialPoints = 100;

      const mockProfile = {
        userId,
        totalPoints: initialPoints,
        level: 2,
        pointsToNextLevel: 50,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(gamificationProfileModel, 'findOne').mockResolvedValue(mockProfile);

      // Adicionar pontos
      const response = await request(app.getHttpServer())
        .post('/gamification/transaction')
        .send({
          userId,
          points: 50,
          sourceType: 'HABIT_COMPLETION',
          sourceId: 'habit-123',
          description: 'Teste de consistência',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockProfile.totalPoints).toBe(initialPoints + 50);
    });
  });
});
