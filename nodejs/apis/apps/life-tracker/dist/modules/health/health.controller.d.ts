import { HealthService } from './health.service';
import { ApiResponse } from '../../types';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    loadHealthPlan(): Promise<ApiResponse<any>>;
    updateHealthProgress(progressData: any): Promise<ApiResponse<any>>;
    markMeal(mealData: {
        day: string;
        meal: string;
    }): Promise<ApiResponse<any>>;
    getLatestLabs(): Promise<ApiResponse<any>>;
    getDietParameters(): Promise<ApiResponse<any>>;
    getRecipes(): Promise<ApiResponse<any[]>>;
    getRecipe(id: string): Promise<ApiResponse<any>>;
    getSupplementation(): Promise<ApiResponse<any[]>>;
    getShoppingList(): Promise<ApiResponse<any>>;
}
