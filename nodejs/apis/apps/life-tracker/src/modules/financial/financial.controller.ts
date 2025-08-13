import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { ApiResponse } from '../../types';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('portfolio')
  async getPortfolio(): Promise<ApiResponse<any>> {
    return this.financialService.getPortfolio();
  }

  @Get('portfolio/summary')
  async getPortfolioSummary(): Promise<ApiResponse<any>> {
    return this.financialService.getPortfolioSummary();
  }

  @Get('assets')
  async getAssets(): Promise<ApiResponse<any[]>> {
    return this.financialService.getAssets();
  }

  @Get('assets/:id')
  async getAsset(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.financialService.getAsset(id);
  }

  @Get('goals')
  async getFinancialGoals(): Promise<ApiResponse<any[]>> {
    return this.financialService.getFinancialGoals();
  }

  @Get('goals/:id')
  async getFinancialGoal(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.financialService.getFinancialGoal(id);
  }

  @Post('goals')
  async createFinancialGoal(@Body() goalData: any): Promise<ApiResponse<any>> {
    return this.financialService.createFinancialGoal(goalData);
  }

  @Put('goals/:id')
  async updateFinancialGoal(
    @Param('id') id: string,
    @Body() goalData: any
  ): Promise<ApiResponse<any>> {
    return this.financialService.updateFinancialGoal(id, goalData);
  }

  @Get('analytics')
  async getFinancialAnalytics(): Promise<ApiResponse<any>> {
    return this.financialService.getFinancialAnalytics();
  }
} 