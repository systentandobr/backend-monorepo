import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GamificationProfile,
  GamificationProfileDocument,
} from './schemas/gamification-profile.schema';
import {
  PointTransaction,
  PointTransactionDocument,
} from './schemas/point-transaction.schema';

@Injectable()
export class PointsService {
  constructor(
    @InjectModel(GamificationProfile.name)
    private gamificationProfileModel: Model<GamificationProfileDocument>,
    @InjectModel(PointTransaction.name)
    private pointTransactionModel: Model<PointTransactionDocument>,
  ) {}

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
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Buscar ou criar perfil do usuário
      let profile = await this.gamificationProfileModel
        .findOne({ userId })
        .exec();

      if (!profile) {
        profile = new this.gamificationProfileModel({
          userId,
          totalPoints: 0,
          level: 1,
          pointsToNextLevel: 100,
        });
      }

      // Adicionar pontos
      profile.totalPoints += points;

      // Calcular novo nível
      const newLevel = Math.floor(profile.totalPoints / 100) + 1;
      const pointsToNextLevel = newLevel * 100 - profile.totalPoints;

      profile.level = newLevel;
      profile.pointsToNextLevel = pointsToNextLevel;
      profile.updatedAt = new Date();

      await profile.save();

      // Registrar transação
      const transaction = new this.pointTransactionModel({
        userId,
        points,
        sourceType,
        sourceId,
        description,
      });

      await transaction.save();

      return {
        success: true,
        data: {
          profile,
          transaction,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao adicionar pontos: ${error.message}`,
      };
    }
  }

  /**
   * Calcula pontos baseado no tipo de ação e dificuldade
   */
  calculatePoints(
    actionType: 'HABIT_COMPLETION' | 'ROUTINE_COMPLETION',
    difficulty?: 'easy' | 'medium' | 'hard',
  ): number {
    const basePoints = {
      HABIT_COMPLETION: 10,
      ROUTINE_COMPLETION: 25,
    };

    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
    };

    const base = basePoints[actionType];
    const multiplier = difficulty ? difficultyMultiplier[difficulty] : 1;

    return Math.floor(base * multiplier);
  }

  /**
   * Obtém histórico de transações do usuário
   */
  async getUserTransactions(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const transactions = await this.pointTransactionModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .exec();

      return {
        success: true,
        data: transactions,
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao buscar transações: ${error.message}`,
      };
    }
  }

  /**
   * Obtém estatísticas de pontos do usuário
   */
  async getUserPointsStats(
    userId: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const profile = await this.gamificationProfileModel
        .findOne({ userId })
        .exec();

      if (!profile) {
        return {
          success: true,
          data: {
            totalPoints: 0,
            level: 1,
            pointsToNextLevel: 100,
            hasProfile: false,
          },
        };
      }

      // Calcular estatísticas adicionais
      const totalTransactions = await this.pointTransactionModel.countDocuments(
        { userId },
      );
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTransactions = await this.pointTransactionModel
        .find({
          userId,
          createdAt: { $gte: today },
        })
        .exec();

      const todayPoints = todayTransactions.reduce(
        (sum, transaction) => sum + transaction.points,
        0,
      );

      return {
        success: true,
        data: {
          ...profile.toObject(),
          hasProfile: true,
          totalTransactions,
          todayPoints,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao buscar estatísticas: ${error.message}`,
      };
    }
  }
}
