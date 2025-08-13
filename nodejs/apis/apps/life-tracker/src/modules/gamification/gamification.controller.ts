import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { ApiResponse } from '../../types';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('game')
  async getGameStatus(): Promise<ApiResponse<any>> {
    return this.gamificationService.getGameStatus();
  }

  @Get('progress')
  async getUserProgress(): Promise<ApiResponse<any>> {
    return this.gamificationService.getUserProgress();
  }

  @Post('points')
  async earnPoints(@Body() pointsData: any): Promise<ApiResponse<any>> {
    return this.gamificationService.earnPoints(pointsData);
  }

  @Get('leaderboard')
  async getLeaderboard(): Promise<ApiResponse<any[]>> {
    return this.gamificationService.getLeaderboard();
  }

  @Get('achievements')
  async getAchievements(): Promise<ApiResponse<any[]>> {
    return this.gamificationService.getAchievements();
  }
} 