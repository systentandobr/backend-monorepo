import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '../../types';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('data')
  async getAnalyticsData(): Promise<ApiResponse<any>> {
    return this.analyticsService.getAnalyticsData();
  }

  @Get('cross-domain')
  async getCrossDomainAnalytics(): Promise<ApiResponse<any>> {
    return this.analyticsService.getCrossDomainAnalytics();
  }

  @Get('performance')
  async getPerformanceMetrics(): Promise<ApiResponse<any>> {
    return this.analyticsService.getPerformanceMetrics();
  }

  @Post('track')
  async trackEvent(@Body() eventData: any): Promise<ApiResponse<any>> {
    return this.analyticsService.trackEvent(eventData);
  }

  @Post('activities/mark')
  async markActivity(@Body() activityData: { activityType: string; completed: boolean }): Promise<ApiResponse<any>> {
    return this.analyticsService.markActivity(activityData);
  }

  @Put('routines/:id')
  async updateRoutine(@Param('id') id: string, @Body() routineData: any): Promise<ApiResponse<any>> {
    return this.analyticsService.updateRoutine(id, routineData);
  }

  @Delete('routines/:id')
  async deleteRoutine(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.analyticsService.deleteRoutine(id);
  }
} 