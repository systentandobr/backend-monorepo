import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { ApiResponse } from '../../types';

@ApiTags('life-tracker')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('profile')
  async getProfile(@Query('userId') userId: string): Promise<ApiResponse<any>> {
    if (!userId) {
      return {
        success: false,
        error: 'userId é obrigatório',
        timestamp: new Date().toISOString(),
      };
    }
    return this.gamificationService.getProfile(userId);
  }

  @Get('achievements')
  async getAchievements(
    @Query('userId') userId: string,
  ): Promise<ApiResponse<any>> {
    if (!userId) {
      return {
        success: false,
        error: 'userId é obrigatório',
        timestamp: new Date().toISOString(),
      };
    }
    return this.gamificationService.getAchievements(userId);
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' | 'all' = 'all',
  ): Promise<ApiResponse<any>> {
    return this.gamificationService.getLeaderboard(period);
  }

  @Post('transaction')
  async addPoints(
    @Body()
    transactionData: {
      userId: string;
      points: number;
      sourceType:
        | 'HABIT_COMPLETION'
        | 'ROUTINE_COMPLETION'
        | 'ACHIEVEMENT'
        | 'BONUS';
      sourceId: string;
      description: string;
    },
  ): Promise<ApiResponse<any>> {
    const { userId, points, sourceType, sourceId, description } =
      transactionData;

    if (!userId || !points || !sourceType || !sourceId || !description) {
      return {
        success: false,
        error: 'Todos os campos são obrigatórios',
        timestamp: new Date().toISOString(),
      };
    }

    return this.gamificationService.addPoints(
      userId,
      points,
      sourceType,
      sourceId,
      description,
    );
  }

  @Post('initialize-achievements')
  async initializeDefaultAchievements(): Promise<ApiResponse<any>> {
    return this.gamificationService.initializeDefaultAchievements();
  }
}
