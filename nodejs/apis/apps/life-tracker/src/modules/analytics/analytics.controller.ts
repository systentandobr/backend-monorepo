import { Controller, Get, Post, Body } from '@nestjs/common';
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
} 