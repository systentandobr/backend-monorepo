import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import {
  GamificationProfile,
  GamificationProfileDocument,
} from './schemas/gamification-profile.schema';
import { PointsService } from './points.service';
import { AchievementService } from './achievement.service';

@Injectable()
export class GamificationService {
  constructor(
    @InjectModel(GamificationProfile.name)
    private gamificationProfileModel: Model<GamificationProfileDocument>,
    private pointsService: PointsService,
    private achievementService: AchievementService,
  ) {}

  /**
   * Obtém o perfil de gamificação do usuário
   */
  async getProfile(userId: string): Promise<ApiResponse<any>> {
    try {
      const result = await this.pointsService.getUserPointsStats(userId);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar perfil de gamificação',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Obtém conquistas do usuário
   */
  async getAchievements(userId: string): Promise<ApiResponse<any>> {
    try {
      const result = await this.achievementService.getUserAchievements(userId);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar conquistas',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Obtém ranking de usuários
   */
  async getLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' | 'all' = 'all',
  ): Promise<ApiResponse<any>> {
    try {
      let dateFilter = {};

      if (period !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (period) {
          case 'daily':
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
            );
            break;
          case 'weekly':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        }

        dateFilter = { updatedAt: { $gte: startDate } };
      }

      const leaderboard = await this.gamificationProfileModel
        .find(dateFilter)
        .sort({ totalPoints: -1 })
        .limit(50)
        .exec();

      // Adicionar posição no ranking
      const leaderboardWithPosition = leaderboard.map((profile, index) => ({
        ...profile.toObject(),
        position: index + 1,
      }));

      return {
        success: true,
        data: {
          entries: leaderboardWithPosition,
          totalUsers: await this.gamificationProfileModel.countDocuments(),
          period,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar ranking',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Adiciona pontos para um usuário
   */
  async addPoints(
    userId: string,
    points: number,
    sourceType:
      | 'HABIT_COMPLETION'
      | 'ROUTINE_COMPLETION'
      | 'ACHIEVEMENT'
      | 'BONUS',
    sourceId: string,
    description: string,
  ): Promise<ApiResponse<any>> {
    try {
      const result = await this.pointsService.addPoints(
        userId,
        points,
        sourceType,
        sourceId,
        description,
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
        };
      }

      // Verificar conquistas após adicionar pontos
      const profile = result.data.profile;
      const userStats = {
        totalPoints: profile.totalPoints,
        streak: 0, // TODO: Implementar cálculo de streak
        habitsCompleted: 0, // TODO: Implementar contagem de hábitos
        routinesCompleted: 0, // TODO: Implementar contagem de rotinas
      };

      const achievementsResult =
        await this.achievementService.checkAndUnlockAchievements(
          userId,
          userStats,
        );

      return {
        success: true,
        data: {
          ...result.data,
          newAchievements: achievementsResult.data || [],
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao adicionar pontos',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Inicializa conquistas padrão do sistema
   */
  async initializeDefaultAchievements(): Promise<ApiResponse<any>> {
    try {
      const result = await this.achievementService.createDefaultAchievements();

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao inicializar conquistas padrão',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
