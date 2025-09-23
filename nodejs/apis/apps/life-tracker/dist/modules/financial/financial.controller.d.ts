import { FinancialService } from './financial.service';
import { ApiResponse } from '../../types';
export declare class FinancialController {
    private readonly financialService;
    constructor(financialService: FinancialService);
    getPortfolio(): Promise<ApiResponse<any>>;
    getPortfolioSummary(): Promise<ApiResponse<any>>;
    getPortfolioRiskAnalysis(): Promise<ApiResponse<any>>;
    getAssets(): Promise<ApiResponse<any[]>>;
    getAsset(id: string): Promise<ApiResponse<any>>;
    getFinancialGoals(): Promise<ApiResponse<any[]>>;
    getFinancialGoal(id: string): Promise<ApiResponse<any>>;
    createFinancialGoal(goalData: any): Promise<ApiResponse<any>>;
    updateFinancialGoal(id: string, goalData: any): Promise<ApiResponse<any>>;
    getFinancialAnalytics(): Promise<ApiResponse<any>>;
}
