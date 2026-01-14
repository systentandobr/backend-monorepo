import { Injectable } from '@nestjs/common';
import { Category } from './schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse, CreateHabitDto, UpdateHabitDto } from '../../types';
import { Habit } from './schemas/habit.schema';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name) private habitModel: Model<Habit>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async getAllHabits(): Promise<ApiResponse<any[]>> {
    try {
      const habits = await this.habitModel.find().exec();

      return {
        success: true,
        data: habits,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar hábitos',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getHabitsByDomain(domain: string): Promise<ApiResponse<any[]>> {
    try {
      const habits = await this.habitModel.find({ domain }).exec();

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

  async getHabitsByCategory(categoryId: number): Promise<ApiResponse<any[]>> {
    try {
      const habits = await this.habitModel.find({ categoryId }).exec();

      return {
        success: true,
        data: habits,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar hábitos da categoria',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getHabitsWithFilters(filters: {
    timeOfDay?: string;
    categoryId?: number;
    completed?: boolean;
  }): Promise<ApiResponse<any[]>> {
    try {
      const query: any = {};

      if (filters.timeOfDay) {
        query.timeOfDay = filters.timeOfDay;
      }

      if (filters.categoryId) {
        query.categoryId = filters.categoryId;
      }

      if (filters.completed !== undefined) {
        query.completed = filters.completed;
      }

      const habits = await this.habitModel.find(query).exec();

      return {
        success: true,
        data: habits,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao filtrar hábitos',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async createHabit(createHabitDto: CreateHabitDto): Promise<ApiResponse<any>> {
    try {
      const habit = new this.habitModel({
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

  async updateHabit(
    id: string,
    updateHabitDto: UpdateHabitDto,
  ): Promise<ApiResponse<any>> {
    try {
      const habit = await this.habitModel
        .findByIdAndUpdate(
          id,
          {
            ...updateHabitDto,
            updatedAt: new Date().toISOString(),
          },
          { new: true },
        )
        .exec();

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

  async deleteHabit(id: string): Promise<ApiResponse<any>> {
    try {
      const habit = await this.habitModel.findByIdAndDelete(id).exec();

      if (!habit) {
        return {
          success: false,
          error: 'Hábito não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: { message: 'Hábito deletado com sucesso' },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao deletar hábito',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async toggleHabit(id: string): Promise<ApiResponse<any>> {
    try {
      const habit = await this.habitModel.findById(id).exec();

      if (!habit) {
        return {
          success: false,
          error: 'Hábito não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      habit.completed = !habit.completed;

      if (habit.completed) {
        habit.streak += 1;
      } else {
        habit.streak = Math.max(0, habit.streak - 1);
      }

      habit.updatedAt = new Date().toISOString();
      await habit.save();

      return {
        success: true,
        data: habit,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao alternar hábito',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getHabitsStats(): Promise<ApiResponse<any>> {
    try {
      const totalHabits = await this.habitModel.countDocuments().exec();
      const completedToday = await this.habitModel
        .countDocuments({
          completed: true,
          updatedAt: { $gte: new Date().toISOString().split('T')[0] },
        })
        .exec();

      const stats = await this.habitModel
        .aggregate([
          {
            $group: {
              _id: '$domain',
              count: { $sum: 1 },
              completed: { $sum: { $cond: ['$completed', 1, 0] } },
              avgStreak: { $avg: '$streak' },
            },
          },
        ])
        .exec();

      // Estatísticas por período do dia
      const timeOfDayStats = await this.habitModel
        .aggregate([
          {
            $group: {
              _id: '$timeOfDay',
              count: { $sum: 1 },
              completed: { $sum: { $cond: ['$completed', 1, 0] } },
            },
          },
        ])
        .exec();

      // Estatísticas por categoria
      const categoryStats = await this.habitModel
        .aggregate([
          {
            $group: {
              _id: '$categoryId',
              count: { $sum: 1 },
              completed: { $sum: { $cond: ['$completed', 1, 0] } },
            },
          },
        ])
        .exec();

      return {
        success: true,
        data: {
          totalHabits,
          completedToday,
          completionRate:
            totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0,
          stats,
          timeOfDayStats,
          categoryStats,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar estatísticas',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getHabitsByTimeOfDay(timeOfDay: string): Promise<ApiResponse<any[]>> {
    try {
      const habits = await this.habitModel.find({ timeOfDay }).exec();

      return {
        success: true,
        data: habits,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar hábitos por período',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getCompletedHabits(): Promise<ApiResponse<any[]>> {
    try {
      const habits = await this.habitModel.find({ completed: true }).exec();

      return {
        success: true,
        data: habits,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar hábitos completados',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getHabitsWithHighStreak(
    minStreak: number = 5,
  ): Promise<ApiResponse<any[]>> {
    try {
      const habits = await this.habitModel
        .find({ streak: { $gte: minStreak } })
        .exec();

      return {
        success: true,
        data: habits,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar hábitos com alta sequência',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async resetHabitStreak(id: string): Promise<ApiResponse<any>> {
    try {
      const habit = await this.habitModel
        .findByIdAndUpdate(
          id,
          {
            streak: 0,
            completed: false,
            updatedAt: new Date().toISOString(),
          },
          { new: true },
        )
        .exec();

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
        error: 'Erro ao resetar sequência do hábito',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async bulkUpdateHabits(
    updates: Array<{ id: string; updates: Partial<UpdateHabitDto> }>,
  ): Promise<ApiResponse<any>> {
    try {
      const results = [];

      for (const update of updates) {
        const habit = await this.habitModel
          .findByIdAndUpdate(
            update.id,
            {
              ...update.updates,
              updatedAt: new Date().toISOString(),
            },
            { new: true },
          )
          .exec();

        if (habit) {
          results.push(habit);
        }
      }

      return {
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao atualizar hábitos em lote',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getCategories(): Promise<ApiResponse<any[]>> {
    try {
      const categories = await this.categoryModel.find().exec();

      // Se n�o h� categorias no banco, retorna dados mock
      if (categories.length === 0) {
        const mockCategories = [
          {
            id: 1,
            name: 'Sa�de',
            description: 'H�bitos relacionados � sa�de f�sica e mental',
            icon: 'heart',
            color: '#ef4444',
            habits: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'Produtividade',
            description: 'H�bitos para melhorar a produtividade e organiza��o',
            icon: 'target',
            color: '#3b82f6',
            habits: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 3,
            name: 'Finan�as',
            description: 'H�bitos para melhorar a sa�de financeira',
            icon: 'dollar-sign',
            color: '#10b981',
            habits: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 4,
            name: 'Bem-estar',
            description: 'H�bitos para melhorar o bem-estar geral',
            icon: 'sun',
            color: '#f59e0b',
            habits: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        return {
          success: true,
          data: mockCategories,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: categories,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar categorias',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async createCategory(categoryData: any): Promise<ApiResponse<any>> {
    try {
      const category = new this.categoryModel({
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const savedCategory = await category.save();

      return {
        success: true,
        data: savedCategory,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao criar categoria',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateCategory(
    id: string,
    categoryData: any,
  ): Promise<ApiResponse<any>> {
    try {
      const updatedCategory = await this.categoryModel
        .findOneAndUpdate(
          { id },
          { ...categoryData, updatedAt: new Date().toISOString() },
          { new: true },
        )
        .exec();

      return {
        success: true,
        data: updatedCategory,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao atualizar categoria',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async deleteCategory(id: string): Promise<ApiResponse<any>> {
    try {
      await this.categoryModel.findOneAndDelete({ id }).exec();

      return {
        success: true,
        data: { message: 'Categoria deletada com sucesso' },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao deletar categoria',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
