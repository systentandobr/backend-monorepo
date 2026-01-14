import { Category } from './schemas/category.schema';
import { Model } from 'mongoose';
import { ApiResponse, CreateHabitDto, UpdateHabitDto } from '../../types';
import { Habit } from './schemas/habit.schema';
export declare class HabitsService {
  private habitModel;
  private categoryModel;
  constructor(habitModel: Model<Habit>, categoryModel: Model<Category>);
  getAllHabits(): Promise<ApiResponse<any[]>>;
  getHabitsByDomain(domain: string): Promise<ApiResponse<any[]>>;
  getHabitsByCategory(categoryId: number): Promise<ApiResponse<any[]>>;
  getHabitsWithFilters(filters: {
    timeOfDay?: string;
    categoryId?: number;
    completed?: boolean;
  }): Promise<ApiResponse<any[]>>;
  createHabit(createHabitDto: CreateHabitDto): Promise<ApiResponse<any>>;
  updateHabit(
    id: string,
    updateHabitDto: UpdateHabitDto,
  ): Promise<ApiResponse<any>>;
  deleteHabit(id: string): Promise<ApiResponse<any>>;
  toggleHabit(id: string): Promise<ApiResponse<any>>;
  getHabitsStats(): Promise<ApiResponse<any>>;
  getHabitsByTimeOfDay(timeOfDay: string): Promise<ApiResponse<any[]>>;
  getCompletedHabits(): Promise<ApiResponse<any[]>>;
  getHabitsWithHighStreak(minStreak?: number): Promise<ApiResponse<any[]>>;
  resetHabitStreak(id: string): Promise<ApiResponse<any>>;
  bulkUpdateHabits(
    updates: Array<{
      id: string;
      updates: Partial<UpdateHabitDto>;
    }>,
  ): Promise<ApiResponse<any>>;
  getCategories(): Promise<ApiResponse<any[]>>;
  createCategory(categoryData: any): Promise<ApiResponse<any>>;
  updateCategory(id: string, categoryData: any): Promise<ApiResponse<any>>;
  deleteCategory(id: string): Promise<ApiResponse<any>>;
}
