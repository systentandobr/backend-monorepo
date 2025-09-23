import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import { BusinessOpportunity } from './schemas/business-opportunity.schema';
import { BusinessProject } from './schemas/business-project.schema';
export declare class BusinessService {
    private opportunityModel;
    private projectModel;
    constructor(opportunityModel: Model<BusinessOpportunity>, projectModel: Model<BusinessProject>);
    getOpportunities(): Promise<ApiResponse<any[]>>;
    getOpportunity(id: string): Promise<ApiResponse<any>>;
    createOpportunity(opportunityData: any): Promise<ApiResponse<any>>;
    getProjects(): Promise<ApiResponse<any[]>>;
    getProject(id: string): Promise<ApiResponse<any>>;
    createProject(projectData: any): Promise<ApiResponse<any>>;
    updateProjectProgress(id: string, progress: number): Promise<ApiResponse<any>>;
    getBusinessHabits(): Promise<ApiResponse<any[]>>;
    getBusinessAnalytics(): Promise<ApiResponse<any>>;
}
