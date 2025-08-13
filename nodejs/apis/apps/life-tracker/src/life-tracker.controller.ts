import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LifeTrackerService } from './life-tracker.service';

@Controller('life-tracker')
export class LifeTrackerController {
  constructor(private readonly lifeTrackerService: LifeTrackerService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'life-tracker' };
  }

  @Get('integrated-plan')
  async getIntegratedPlan() {
    return this.lifeTrackerService.getIntegratedPlan();
  }

  @Get('dashboard-summary')
  async getDashboardSummary() {
    return this.lifeTrackerService.getDashboardSummary();
  }

  @Get('cross-module-progress')
  async getCrossModuleProgress() {
    return this.lifeTrackerService.getCrossModuleProgress();
  }
} 