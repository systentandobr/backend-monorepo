import { BusinessService } from './business.service';
import { ApiResponse } from '../../types';
export declare class BusinessController {
  private readonly businessService;
  constructor(businessService: BusinessService);
  getOpportunities(): Promise<ApiResponse<any[]>>;
  getOpportunity(id: string): Promise<ApiResponse<any>>;
  createOpportunity(opportunityData: any): Promise<ApiResponse<any>>;
  getBusinessHabits(): Promise<ApiResponse<any[]>>;
  getProjects(): Promise<ApiResponse<any[]>>;
  getProject(id: string): Promise<ApiResponse<any>>;
  createProject(projectData: any): Promise<ApiResponse<any>>;
  updateProjectProgress(
    id: string,
    progressData: {
      progress: number;
    },
  ): Promise<ApiResponse<any>>;
  getBusinessAnalytics(): Promise<ApiResponse<any>>;
}
