import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { ApiResponse } from '../../types';

@ApiTags('life-tracker')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('analytics/load')
  async loadHealthPlan(): Promise<ApiResponse<any>> {
    return this.healthService.loadHealthPlan();
  }

  @Post('analytics/progress')
  async updateHealthProgress(@Body() progressData: any): Promise<ApiResponse<any>> {
    return this.healthService.updateHealthProgress(progressData);
  }

  @Post('analytics/meals/mark')
  async markMeal(@Body() mealData: { day: string; meal: string }): Promise<ApiResponse<any>> {
    return this.healthService.markMeal(mealData);
  }

  @Get('labs/latest')
  async getLatestLabs(): Promise<ApiResponse<any>> {
    return this.healthService.getLatestLabs();
  }

  @Get('diet/parameters')
  async getDietParameters(): Promise<ApiResponse<any>> {
    return this.healthService.getDietParameters();
  }

  @Get('recipes')
  async getRecipes(): Promise<ApiResponse<any[]>> {
    return this.healthService.getRecipes();
  }

  @Get('recipes/:id')
  async getRecipe(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.healthService.getRecipe(id);
  }

  @Get('supplementation')
  async getSupplementation(): Promise<ApiResponse<any[]>> {
    return this.healthService.getSupplementation();
  }

  @Get('shopping-list')
  async getShoppingList(): Promise<ApiResponse<any>> {
    return this.healthService.getShoppingList();
  }
} 