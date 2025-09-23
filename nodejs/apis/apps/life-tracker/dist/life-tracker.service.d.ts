export declare class LifeTrackerService {
    getIntegratedPlan(): Promise<{
        success: boolean;
        data: {
            schema_version: string;
            generated_at: string;
            locale: string;
        };
    }>;
    getDashboardSummary(): Promise<{
        success: boolean;
        data: {
            total_habits: number;
            completed_today: number;
            weekly_progress: number;
        };
    }>;
    getCrossModuleProgress(): Promise<{
        success: boolean;
        data: {
            healthness: {
                progress: number;
                goals: any[];
            };
            finances: {
                progress: number;
                goals: any[];
            };
            business: {
                progress: number;
                goals: any[];
            };
            productivity: {
                progress: number;
                goals: any[];
            };
        };
    }>;
}
