import { RoutinesService } from './routines.service';
import {
  ApiResponse,
  IntegratedRoutine,
  CreateHabitDto,
  UpdateHabitDto,
  CompleteHabitDto,
} from '../../types';
export declare class RoutinesController {
  private readonly routinesService;
  constructor(routinesService: RoutinesService);
  getIntegratedPlan(): Promise<ApiResponse<IntegratedRoutine>>;
  getHabitsByDomain(domain: string): Promise<ApiResponse<any[]>>;
  getIntegratedGoals(): Promise<ApiResponse<any[]>>;
  createHabit(createHabitDto: CreateHabitDto): Promise<ApiResponse<any>>;
  updateHabit(
    id: string,
    updateHabitDto: UpdateHabitDto,
  ): Promise<ApiResponse<any>>;
  completeHabit(completeHabitDto: CompleteHabitDto): Promise<ApiResponse<any>>;
  updateIntegratedGoalProgress(
    id: string,
    body: {
      progress: number;
    },
  ): Promise<ApiResponse<any>>;
}
