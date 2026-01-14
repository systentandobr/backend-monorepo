import { HabitsService } from './habits.service';
import { ApiResponse, CreateHabitDto, UpdateHabitDto } from '../../types';
import { HabitDto, UpdateCategoryDto } from '../../types/dtos/definitions';
export declare class HabitsController {
  private readonly habitsService;
  constructor(habitsService: HabitsService);
  getAllHabits(): Promise<ApiResponse<HabitDto[]>>;
  getCategories(): Promise<ApiResponse<UpdateCategoryDto[]>>;
  getHabitsByDomain(domain: string): Promise<ApiResponse<HabitDto[]>>;
  getHabitsByCategory(categoryId: number): Promise<ApiResponse<HabitDto[]>>;
  getHabitsWithFilters(
    timeOfDay?: string,
    categoryId?: number,
    completed?: boolean,
  ): Promise<ApiResponse<any[]>>;
  createHabit(createHabitDto: CreateHabitDto): Promise<ApiResponse<any>>;
  updateHabit(
    id: string,
    updateHabitDto: UpdateHabitDto,
  ): Promise<ApiResponse<any>>;
  deleteHabit(id: string): Promise<ApiResponse<any>>;
  toggleHabit(id: string): Promise<ApiResponse<any>>;
  getHabitsStats(): Promise<ApiResponse<any>>;
}
