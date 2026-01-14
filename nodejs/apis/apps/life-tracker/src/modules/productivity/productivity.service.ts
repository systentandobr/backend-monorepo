import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import { ProductivityGoal } from './schemas/productivity-goal.schema';

@Injectable()
export class ProductivityService {
  constructor(
    @InjectModel(ProductivityGoal.name)
    private productivityGoalModel: Model<ProductivityGoal>,
  ) {}

  async getProductivityGoals(): Promise<ApiResponse<any[]>> {
    try {
      const goals = await this.productivityGoalModel.find().exec();

      return {
        success: true,
        data: goals,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar metas de produtividade',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getProductivityGoal(id: string): Promise<ApiResponse<any>> {
    try {
      const goal = await this.productivityGoalModel.findById(id).exec();

      if (!goal) {
        return {
          success: false,
          error: 'Meta de produtividade não encontrada',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: goal,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar meta de produtividade',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async createProductivityGoal(goalData: any): Promise<ApiResponse<any>> {
    try {
      const goal = new this.productivityGoalModel({
        ...goalData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const savedGoal = await goal.save();

      return {
        success: true,
        data: savedGoal,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao criar meta de produtividade',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateGoalProgress(
    id: string,
    progress: number,
  ): Promise<ApiResponse<any>> {
    try {
      const goal = await this.productivityGoalModel
        .findByIdAndUpdate(
          id,
          {
            progress,
            updatedAt: new Date().toISOString(),
          },
          { new: true },
        )
        .exec();

      if (!goal) {
        return {
          success: false,
          error: 'Meta de produtividade não encontrada',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: goal,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao atualizar progresso da meta',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getProductivityAnalytics(): Promise<ApiResponse<any>> {
    try {
      const goals = await this.productivityGoalModel.find().exec();

      const totalGoals = goals.length;
      const completedGoals = goals.filter((g) => g.progress === 100).length;
      const avgProgress =
        goals.reduce((acc, g) => acc + g.progress, 0) / goals.length || 0;

      return {
        success: true,
        data: {
          total_goals: totalGoals,
          completed_goals: completedGoals,
          average_progress: avgProgress,
          completion_rate:
            totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar analytics de produtividade',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
