import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductivityService } from './productivity.service';
import { ApiResponse } from '../../types';

@ApiTags('life-tracker')
@Controller('productivity')
export class ProductivityController {
  constructor(private readonly productivityService: ProductivityService) {}

  @Get('goals')
  async getProductivityGoals(): Promise<ApiResponse<any[]>> {
    return this.productivityService.getProductivityGoals();
  }

  @Get('goals/:id')
  async getProductivityGoal(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.productivityService.getProductivityGoal(id);
  }

  @Post('goals')
  async createProductivityGoal(@Body() goalData: any): Promise<ApiResponse<any>> {
    return this.productivityService.createProductivityGoal(goalData);
  }

  @Put('goals/:id/progress')
  async updateGoalProgress(
    @Param('id') id: string,
    @Body() progressData: { progress: number }
  ): Promise<ApiResponse<any>> {
    return this.productivityService.updateGoalProgress(id, progressData.progress);
  }

  @Get('analytics')
  async getProductivityAnalytics(): Promise<ApiResponse<any>> {
    return this.productivityService.getProductivityAnalytics();
  }
} 