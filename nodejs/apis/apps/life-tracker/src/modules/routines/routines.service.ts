import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse, IntegratedRoutine, CreateHabitDto, UpdateHabitDto, CompleteHabitDto } from '../../types';
import { Routine } from './schemas/routine.schema';
import { IntegratedRoutine as IntegratedRoutineModel } from './schemas/integrated-routine.schema';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectModel(Routine.name) private routineModel: Model<Routine>,
    @InjectModel(IntegratedRoutineModel.name) private integratedRoutineModel: Model<IntegratedRoutineModel>,
  ) {}

  async getIntegratedPlan(): Promise<ApiResponse<IntegratedRoutine>> {
    try {
      const plan = await this.integratedRoutineModel.findOne().exec();
      
      if (!plan) {
        return {
          success: false,
          error: 'Plano integrado não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: plan,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar plano integrado',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getHabitsByDomain(domain: string): Promise<ApiResponse<any[]>> {
    try {
      const habits = await this.routineModel.find({ domain }).exec();
      
      return {
        success: true,
        data: habits,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar hábitos do domínio',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getIntegratedGoals(): Promise<ApiResponse<any[]>> {
    try {
      const plan = await this.integratedRoutineModel.findOne().exec();
      
      if (!plan) {
        return {
          success: false,
          error: 'Metas integradas não encontradas',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: plan.integrated_goals || [],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar metas integradas',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async createHabit(createHabitDto: CreateHabitDto): Promise<ApiResponse<any>> {
    try {
      const habit = new this.routineModel({
        ...createHabitDto,
        streak: 0,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const savedHabit = await habit.save();

      return {
        success: true,
        data: savedHabit,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao criar hábito',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateHabit(id: string, updateHabitDto: UpdateHabitDto): Promise<ApiResponse<any>> {
    try {
      const habit = await this.routineModel.findByIdAndUpdate(
        id,
        {
          ...updateHabitDto,
          updatedAt: new Date().toISOString(),
        },
        { new: true }
      ).exec();

      if (!habit) {
        return {
          success: false,
          error: 'Hábito não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: habit,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao atualizar hábito',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async completeHabit(completeHabitDto: CompleteHabitDto): Promise<ApiResponse<any>> {
    try {
      const habit = await this.routineModel.findOneAndUpdate(
        { 
          id: completeHabitDto.habitId,
          domain: completeHabitDto.domain 
        },
        {
          completed: true,
          streak: { $inc: 1 },
          updatedAt: new Date().toISOString(),
        },
        { new: true }
      ).exec();

      if (!habit) {
        return {
          success: false,
          error: 'Hábito não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: habit,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao completar hábito',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateIntegratedGoalProgress(goalId: string, progress: number): Promise<ApiResponse<any>> {
    try {
      const result = await this.integratedRoutineModel.updateOne(
        { 'integrated_goals.id': goalId },
        { $set: { 'integrated_goals.$.progress': progress } }
      ).exec();

      if (result.modifiedCount === 0) {
        return {
          success: false,
          error: 'Meta integrada não encontrada',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: { goalId, progress },
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
} 