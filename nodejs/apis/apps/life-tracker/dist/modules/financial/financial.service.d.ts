import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import { Portfolio } from './schemas/portfolio.schema';
import { Asset } from './schemas/asset.schema';
import { FinancialGoal } from './schemas/financial-goal.schema';
import { AddAssetDto, UpdateAssetDto, CreateGoalDto, UpdateGoalDto } from './financial.controller';
export declare class FinancialService {
    private portfolioModel;
    private assetModel;
    private financialGoalModel;
    constructor(portfolioModel: Model<Portfolio>, assetModel: Model<Asset>, financialGoalModel: Model<FinancialGoal>);
    getPortfolio(userId: string): Promise<ApiResponse<any>>;
    getPortfolioSummary(userId: string): Promise<ApiResponse<any>>;
    getAssets(): Promise<ApiResponse<any[]>>;
    getAsset(id: string): Promise<ApiResponse<any>>;
    getPortfolioRiskAnalysis(userId: string): Promise<ApiResponse<any>>;
    getFinancialAnalytics(): Promise<ApiResponse<any>>;
    addAsset(userId: string, assetData: AddAssetDto): Promise<ApiResponse<any>>;
    updateAsset(userId: string, assetId: string, assetData: UpdateAssetDto): Promise<ApiResponse<any>>;
    removeAsset(userId: string, assetId: string): Promise<ApiResponse<any>>;
    getFinancialGoals(userId: string): Promise<ApiResponse<any[]>>;
    getFinancialGoal(userId: string, id: string): Promise<ApiResponse<any>>;
    createFinancialGoal(userId: string, goalData: CreateGoalDto): Promise<ApiResponse<any>>;
    updateFinancialGoal(userId: string, id: string, goalData: UpdateGoalDto): Promise<ApiResponse<any>>;
    deleteFinancialGoal(userId: string, id: string): Promise<ApiResponse<any>>;
    getMarketData(symbols: string[]): Promise<ApiResponse<any[]>>;
    getPriceHistory(symbol: string, period: string): Promise<ApiResponse<any>>;
}
