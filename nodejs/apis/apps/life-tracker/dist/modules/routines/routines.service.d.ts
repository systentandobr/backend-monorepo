import { Model } from 'mongoose';
import { ApiResponse, IntegratedRoutine, CreateHabitDto, UpdateHabitDto, CompleteHabitDto } from '../../types';
import { Routine } from './schemas/routine.schema';
import { IntegratedRoutine as IntegratedRoutineModel } from './schemas/integrated-routine.schema';
export declare class RoutinesService {
    private routineModel;
    private integratedRoutineModel;
    constructor(routineModel: Model<Routine>, integratedRoutineModel: Model<IntegratedRoutineModel>);
    getIntegratedPlan(): Promise<ApiResponse<IntegratedRoutine>>;
    getHabitsByDomain(domain: string): Promise<ApiResponse<any[]>>;
    getIntegratedGoals(): Promise<ApiResponse<any[]>>;
    createHabit(createHabitDto: CreateHabitDto): Promise<ApiResponse<any>>;
    updateHabit(id: string, updateHabitDto: UpdateHabitDto): Promise<ApiResponse<any>>;
    completeHabit(completeHabitDto: CompleteHabitDto): Promise<ApiResponse<any>>;
    updateIntegratedGoalProgress(goalId: string, progress: number): Promise<ApiResponse<any>>;
}
