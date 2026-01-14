import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Achievement, AchievementDocument } from './schemas/achievement.schema';
import {
  UserAchievement,
  UserAchievementDocument,
} from './schemas/user-achievement.schema';
import {
  GamificationProfile,
  GamificationProfileDocument,
} from './schemas/gamification-profile.schema';

@Injectable()
export class AchievementService {
  constructor(
    @InjectModel(Achievement.name)
    private achievementModel: Model<AchievementDocument>,
    @InjectModel(UserAchievement.name)
    private userAchievementModel: Model<UserAchievementDocument>,
    @InjectModel(GamificationProfile.name)
    private gamificationProfileModel: Model<GamificationProfileDocument>,
  ) {}

  /**
   * Obtém todas as conquistas disponíveis
   */
  async getAllAchievements(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const achievements = await this.achievementModel.find().exec();
      return {
        success: true,
        data: achievements,
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao buscar conquistas: ${error.message}`,
      };
    }
  }

  /**
   * Obtém conquistas do usuário com status de desbloqueio
   */
  async getUserAchievements(
    userId: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const achievements = await this.achievementModel.find().exec();
      const userAchievements = await this.userAchievementModel
        .find({ userId })
        .exec();

      const userAchievementIds = new Set(
        userAchievements.map((ua) => ua.achievementId),
      );

      const achievementsWithStatus = achievements.map((achievement) => ({
        ...achievement.toObject(),
        unlocked: userAchievementIds.has(achievement.achievementId),
        unlockedAt: userAchievements.find(
          (ua) => ua.achievementId === achievement.achievementId,
        )?.unlockedAt,
      }));

      const unlockedCount = achievementsWithStatus.filter(
        (a) => a.unlocked,
      ).length;
      const totalCount = achievements.length;

      return {
        success: true,
        data: {
          achievements: achievementsWithStatus,
          unlockedCount,
          totalCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao buscar conquistas do usuário: ${error.message}`,
      };
    }
  }

  /**
   * Verifica e desbloqueia conquistas para um usuário
   */
  async checkAndUnlockAchievements(
    userId: string,
    userStats: {
      totalPoints: number;
      streak: number;
      habitsCompleted: number;
      routinesCompleted: number;
    },
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const achievements = await this.achievementModel.find().exec();
      const userAchievements = await this.userAchievementModel
        .find({ userId })
        .exec();

      const userAchievementIds = new Set(
        userAchievements.map((ua) => ua.achievementId),
      );
      const newlyUnlocked: any[] = [];

      for (const achievement of achievements) {
        // Pular se já desbloqueada
        if (userAchievementIds.has(achievement.achievementId)) {
          continue;
        }

        // Verificar critérios
        const shouldUnlock = this.checkAchievementCriteria(
          achievement.criteria,
          userStats,
        );

        if (shouldUnlock) {
          // Desbloquear conquista
          const userAchievement = new this.userAchievementModel({
            userId,
            achievementId: achievement.achievementId,
            unlockedAt: new Date(),
          });

          await userAchievement.save();
          newlyUnlocked.push(achievement);
        }
      }

      return {
        success: true,
        data: newlyUnlocked,
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao verificar conquistas: ${error.message}`,
      };
    }
  }

  /**
   * Verifica se os critérios de uma conquista foram atendidos
   */
  private checkAchievementCriteria(
    criteria: { criteriaType: string; value: number },
    userStats: {
      totalPoints: number;
      streak: number;
      habitsCompleted: number;
      routinesCompleted: number;
    },
  ): boolean {
    const { criteriaType, value } = criteria;

    switch (criteriaType) {
      case 'POINTS':
        return userStats.totalPoints >= value;
      case 'STREAK':
        return userStats.streak >= value;
      case 'HABIT_COUNT':
        return userStats.habitsCompleted >= value;
      case 'ROUTINE_COUNT':
        return userStats.routinesCompleted >= value;
      default:
        return false;
    }
  }

  /**
   * Cria conquistas padrão do sistema
   */
  async createDefaultAchievements(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const defaultAchievements = [
        {
          achievementId: 'first_habit',
          name: 'Primeiro Hábito',
          description: 'Complete seu primeiro hábito',
          icon: 'star',
          criteria: { type: 'HABIT_COUNT', value: 1 },
        },
        {
          achievementId: 'streak_7',
          name: 'Série de 7 Dias',
          description: 'Complete um hábito por 7 dias seguidos',
          icon: 'flame',
          criteria: { type: 'STREAK', value: 7 },
        },
        {
          achievementId: 'points_1000',
          name: 'Mil Pontos',
          description: 'Acumule 1000 pontos',
          icon: 'trophy',
          criteria: { type: 'POINTS', value: 1000 },
        },
        {
          achievementId: 'routine_master',
          name: 'Mestre das Rotinas',
          description: 'Complete 10 rotinas',
          icon: 'check-circle',
          criteria: { type: 'ROUTINE_COUNT', value: 10 },
        },
        {
          achievementId: 'habit_master',
          name: 'Mestre dos Hábitos',
          description: 'Complete 50 hábitos',
          icon: 'target',
          criteria: { type: 'HABIT_COUNT', value: 50 },
        },
      ];

      const createdAchievements = [];

      for (const achievementData of defaultAchievements) {
        const existingAchievement = await this.achievementModel
          .findOne({ achievementId: achievementData.achievementId })
          .exec();

        if (!existingAchievement) {
          const achievement = new this.achievementModel(achievementData);
          await achievement.save();
          createdAchievements.push(achievement);
        }
      }

      return {
        success: true,
        data: createdAchievements,
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao criar conquistas padrão: ${error.message}`,
      };
    }
  }
}
