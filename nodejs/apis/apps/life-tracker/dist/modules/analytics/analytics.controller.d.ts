import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '../../types';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
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
