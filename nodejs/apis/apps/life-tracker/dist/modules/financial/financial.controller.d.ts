import { FinancialService } from './financial.service';
import { ApiResponse } from '../../types';
export interface AddAssetDto {
  symbol: string;
  quantity: number;
  averagePrice: number;
}
export interface UpdateAssetDto {
  symbol?: string;
  quantity?: number;
  averagePrice?: number;
}
export interface CreateGoalDto {
  name: string;
  targetAmount: number;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
}
export interface UpdateGoalDto {
  name?: string;
  targetAmount?: number;
  targetDate?: string;
  priority?: 'low' | 'medium' | 'high';
  currentAmount?: number;
}
export interface MarketDataRequestDto {
  symbols: string[];
}
export declare class FinancialController {
  private readonly financialService;
  constructor(financialService: FinancialService);
  getPortfolio(req: any): Promise<ApiResponse<any>>;
  getPortfolioRiskAnalysis(req: any): Promise<ApiResponse<any>>;
  addAsset(req: any, assetData: AddAssetDto): Promise<ApiResponse<any>>;
  updateAsset(
    req: any,
    assetId: string,
    assetData: UpdateAssetDto,
  ): Promise<ApiResponse<any>>;
  removeAsset(req: any, assetId: string): Promise<ApiResponse<any>>;
  getFinancialGoals(req: any): Promise<ApiResponse<any[]>>;
  getFinancialGoal(req: any, id: string): Promise<ApiResponse<any>>;
  createFinancialGoal(
    req: any,
    goalData: CreateGoalDto,
  ): Promise<ApiResponse<any>>;
  updateFinancialGoal(
    req: any,
    id: string,
    goalData: UpdateGoalDto,
  ): Promise<ApiResponse<any>>;
  deleteFinancialGoal(req: any, id: string): Promise<ApiResponse<any>>;
  getMarketData(
    req: any,
    requestData: MarketDataRequestDto,
  ): Promise<ApiResponse<any[]>>;
  getPriceHistory(
    req: any,
    symbol: string,
    period?: string,
  ): Promise<ApiResponse<any>>;
}
