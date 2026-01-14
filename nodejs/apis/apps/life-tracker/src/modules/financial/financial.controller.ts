import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { ApiResponse } from '../../types';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

// DTOs baseados nos contratos
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

@ApiTags('life-tracker')
@Controller('financial')
@UseGuards(JwtAuthGuard)
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('portfolio')
  async getPortfolio(@Request() req): Promise<ApiResponse<any>> {
    return this.financialService.getPortfolio(req.user.id);
  }

  @Get('portfolio/risk-analysis')
  async getPortfolioRiskAnalysis(@Request() req): Promise<ApiResponse<any>> {
    return this.financialService.getPortfolioRiskAnalysis(req.user.id);
  }

  @Post('portfolio/assets')
  async addAsset(
    @Request() req,
    @Body() assetData: AddAssetDto,
  ): Promise<ApiResponse<any>> {
    return this.financialService.addAsset(req.user.id, assetData);
  }

  @Patch('portfolio/assets/:assetId')
  async updateAsset(
    @Request() req,
    @Param('assetId') assetId: string,
    @Body() assetData: UpdateAssetDto,
  ): Promise<ApiResponse<any>> {
    return this.financialService.updateAsset(req.user.id, assetId, assetData);
  }

  @Delete('portfolio/assets/:assetId')
  async removeAsset(
    @Request() req,
    @Param('assetId') assetId: string,
  ): Promise<ApiResponse<any>> {
    return this.financialService.removeAsset(req.user.id, assetId);
  }

  @Get('goals')
  async getFinancialGoals(@Request() req): Promise<ApiResponse<any[]>> {
    return this.financialService.getFinancialGoals(req.user.id);
  }

  @Get('goals/:id')
  async getFinancialGoal(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    return this.financialService.getFinancialGoal(req.user.id, id);
  }

  @Post('goals')
  async createFinancialGoal(
    @Request() req,
    @Body() goalData: CreateGoalDto,
  ): Promise<ApiResponse<any>> {
    return this.financialService.createFinancialGoal(req.user.id, goalData);
  }

  @Patch('goals/:id')
  async updateFinancialGoal(
    @Request() req,
    @Param('id') id: string,
    @Body() goalData: UpdateGoalDto,
  ): Promise<ApiResponse<any>> {
    return this.financialService.updateFinancialGoal(req.user.id, id, goalData);
  }

  @Delete('goals/:id')
  async deleteFinancialGoal(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    return this.financialService.deleteFinancialGoal(req.user.id, id);
  }

  @Post('market-data')
  async getMarketData(
    @Request() req,
    @Body() requestData: MarketDataRequestDto,
  ): Promise<ApiResponse<any[]>> {
    return this.financialService.getMarketData(requestData.symbols);
  }

  @Get('price-history/:symbol')
  async getPriceHistory(
    @Request() req,
    @Param('symbol') symbol: string,
    @Param('period') period?: string,
  ): Promise<ApiResponse<any>> {
    return this.financialService.getPriceHistory(symbol, period || '1m');
  }
}
