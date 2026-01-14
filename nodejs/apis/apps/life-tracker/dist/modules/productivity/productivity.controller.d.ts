import { ProductivityService } from './productivity.service';
import { ApiResponse } from '../../types';
export declare class ProductivityController {
  private readonly productivityService;
  constructor(productivityService: ProductivityService);
  getProductivityGoals(): Promise<ApiResponse<any[]>>;
  getProductivityGoal(id: string): Promise<ApiResponse<any>>;
  createProductivityGoal(goalData: any): Promise<ApiResponse<any>>;
  updateGoalProgress(
    id: string,
    progressData: {
      progress: number;
    },
  ): Promise<ApiResponse<any>>;
  getProductivityAnalytics(): Promise<ApiResponse<any>>;
}
