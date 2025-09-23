import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import { HealthPlan } from './schemas/health-plan.schema';
import { LatestLabs } from './schemas/latest-labs.schema';
import { DietParameters } from './schemas/diet-parameters.schema';
import { Recipe } from './schemas/recipe.schema';
export declare class HealthService {
    private healthPlanModel;
    private latestLabsModel;
    private dietParametersModel;
    private recipeModel;
    constructor(healthPlanModel: Model<HealthPlan>, latestLabsModel: Model<LatestLabs>, dietParametersModel: Model<DietParameters>, recipeModel: Model<Recipe>);
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
