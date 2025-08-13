import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import { Game } from './schemas/game.schema';
import { UserProgress } from './schemas/user-progress.schema';

@Injectable()
export class GamificationService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    @InjectModel(UserProgress.name) private userProgressModel: Model<UserProgress>,
  ) {}

  async getGameStatus(): Promise<ApiResponse<any>> {
    try {
      const game = await this.gameModel.findOne().exec();
      
      return {
        success: true,
        data: game || {},
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar status do jogo',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getUserProgress(): Promise<ApiResponse<any>> {
    try {
      const progress = await this.userProgressModel.findOne().exec();
      
      return {
        success: true,
        data: progress || {},
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar progresso do usuário',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async earnPoints(pointsData: any): Promise<ApiResponse<any>> {
    try {
      const progress = await this.userProgressModel.findOne().exec();
      
      if (progress) {
        progress.total_points += pointsData.points;
        progress.weekly_points += pointsData.points;
        progress.updatedAt = new Date().toISOString();
        await progress.save();
      }

      return {
        success: true,
        data: progress,
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

  async getLeaderboard(): Promise<ApiResponse<any[]>> {
    try {
      const leaderboard = await this.userProgressModel
        .find()
        .sort({ total_points: -1 })
        .limit(10)
        .exec();
      
      return {
        success: true,
        data: leaderboard,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar leaderboard',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getAchievements(): Promise<ApiResponse<any[]>> {
    try {
      // Implementação para achievements
      return {
        success: true,
        data: [],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar achievements',
        timestamp: new Date().toISOString(),
      };
    }
  }
} 