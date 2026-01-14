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
import { HabitsService } from './habits.service';
import { ApiResponse, CreateHabitDto, UpdateHabitDto } from '../../types';
import { HabitDto, UpdateCategoryDto } from '../../types/dtos/definitions';

@ApiTags('life-tracker')
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  async getAllHabits(): Promise<ApiResponse<HabitDto[]>> {
    return this.habitsService.getAllHabits();
  }

  @Get('categories')
  async getCategories(): Promise<ApiResponse<UpdateCategoryDto[]>> {
    return this.habitsService.getCategories();
  }

  @Get('domain/:domain')
  async getHabitsByDomain(
    @Param('domain') domain: string,
  ): Promise<ApiResponse<HabitDto[]>> {
    return this.habitsService.getHabitsByDomain(domain);
  }

  @Get('categories/:categoryId')
  async getHabitsByCategory(
    @Param('categoryId') categoryId: number,
  ): Promise<ApiResponse<HabitDto[]>> {
    return this.habitsService.getHabitsByCategory(categoryId);
  }

  @Get('filters')
  async getHabitsWithFilters(
    @Query('timeOfDay') timeOfDay?: string,
    @Query('categoryId') categoryId?: number,
    @Query('completed') completed?: boolean,
  ): Promise<ApiResponse<any[]>> {
    return this.habitsService.getHabitsWithFilters({
      timeOfDay,
      categoryId,
      completed,
    });
  }

  @Post()
  async createHabit(
    @Body() createHabitDto: CreateHabitDto,
  ): Promise<ApiResponse<any>> {
    return this.habitsService.createHabit(createHabitDto);
  }

  @Put(':id')
  async updateHabit(
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
  ): Promise<ApiResponse<any>> {
    return this.habitsService.updateHabit(id, updateHabitDto);
  }

  @Delete(':id')
  async deleteHabit(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.habitsService.deleteHabit(id);
  }

  @Post(':id/toggle')
  async toggleHabit(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.habitsService.toggleHabit(id);
  }

  @Get('stats')
  async getHabitsStats(): Promise<ApiResponse<any>> {
    return this.habitsService.getHabitsStats();
  }
}
