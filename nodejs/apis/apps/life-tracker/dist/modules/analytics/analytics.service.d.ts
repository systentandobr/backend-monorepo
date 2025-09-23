import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import { AnalyticsData } from './schemas/analytics-data.schema';
export declare class AnalyticsService {
    private analyticsDataModel;
    constructor(analyticsDataModel: Model<AnalyticsData>);
    getAnalyticsData(): Promise<ApiResponse<any>>;
    getCrossDomainAnalytics(): Promise<ApiResponse<any>>;
    getPerformanceMetrics(): Promise<ApiResponse<any>>;
    trackEvent(eventData: any): Promise<ApiResponse<any>>;
    markActivity(activityData: {
        activityType: string;
        completed: boolean;
    }): Promise<ApiResponse<any>>;
    updateRoutine(id: string, routineData: any): Promise<ApiResponse<any>>;
    deleteRoutine(id: string): Promise<ApiResponse<any>>;
}
