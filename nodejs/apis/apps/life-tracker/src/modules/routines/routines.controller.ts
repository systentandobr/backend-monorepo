import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoutinesService } from './routines.service';
import {
  ApiResponse,
  IntegratedRoutine,
  CreateHabitDto,
  UpdateHabitDto,
  CompleteHabitDto,
} from '../../types';

@ApiTags('life-tracker')
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Get('integrated-plan')
  async getIntegratedPlan(): Promise<ApiResponse<IntegratedRoutine>> {
    return this.routinesService.getIntegratedPlan();
  }

  @Get('habits/:domain')
  async getHabitsByDomain(
    @Param('domain') domain: string,
  ): Promise<ApiResponse<any[]>> {
    return this.routinesService.getHabitsByDomain(domain);
  }

  @Get('integrated-goals')
  async getIntegratedGoals(): Promise<ApiResponse<any[]>> {
    return this.routinesService.getIntegratedGoals();
  }

  @Post('habits')
  async createHabit(
    @Body() createHabitDto: CreateHabitDto,
  ): Promise<ApiResponse<any>> {
    return this.routinesService.createHabit(createHabitDto);
  }

  @Put('habits/:id')
  async updateHabit(
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
  ): Promise<ApiResponse<any>> {
    return this.routinesService.updateHabit(id, updateHabitDto);
  }

  @Post('habits/complete')
  async completeHabit(
    @Body() completeHabitDto: CompleteHabitDto,
  ): Promise<ApiResponse<any>> {
    return this.routinesService.completeHabit(completeHabitDto);
  }

  @Put('integrated-goals/:id/progress')
  async updateIntegratedGoalProgress(
    @Param('id') id: string,
    @Body() body: { progress: number },
  ): Promise<ApiResponse<any>> {
    return this.routinesService.updateIntegratedGoalProgress(id, body.progress);
  }
}
