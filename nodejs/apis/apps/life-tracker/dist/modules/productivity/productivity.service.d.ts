import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import { ProductivityGoal } from './schemas/productivity-goal.schema';
export declare class ProductivityService {
  private productivityGoalModel;
  constructor(productivityGoalModel: Model<ProductivityGoal>);
  getProductivityGoals(): Promise<ApiResponse<any[]>>;
  getProductivityGoal(id: string): Promise<ApiResponse<any>>;
  createProductivityGoal(goalData: any): Promise<ApiResponse<any>>;
  updateGoalProgress(id: string, progress: number): Promise<ApiResponse<any>>;
  getProductivityAnalytics(): Promise<ApiResponse<any>>;
}
