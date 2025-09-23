import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import { Portfolio } from './schemas/portfolio.schema';
import { Asset } from './schemas/asset.schema';
import { FinancialGoal } from './schemas/financial-goal.schema';
export declare class FinancialService {
    private portfolioModel;
    private assetModel;
    private financialGoalModel;
    constructor(portfolioModel: Model<Portfolio>, assetModel: Model<Asset>, financialGoalModel: Model<FinancialGoal>);
    getPortfolio(): Promise<ApiResponse<any>>;
    getPortfolioSummary(): Promise<ApiResponse<any>>;
    getAssets(): Promise<ApiResponse<any[]>>;
    getAsset(id: string): Promise<ApiResponse<any>>;
    getFinancialGoals(): Promise<ApiResponse<any[]>>;
    getFinancialGoal(id: string): Promise<ApiResponse<any>>;
    createFinancialGoal(goalData: any): Promise<ApiResponse<any>>;
    updateFinancialGoal(id: string, goalData: any): Promise<ApiResponse<any>>;
    getPortfolioRiskAnalysis(): Promise<ApiResponse<any>>;
    getFinancialAnalytics(): Promise<ApiResponse<any>>;
}
