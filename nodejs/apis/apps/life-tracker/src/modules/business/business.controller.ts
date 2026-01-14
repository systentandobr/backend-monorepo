import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { ApiResponse } from '../../types';

@ApiTags('life-tracker')
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('opportunities')
  async getOpportunities(): Promise<ApiResponse<any[]>> {
    return this.businessService.getOpportunities();
  }

  @Get('opportunities/:id')
  async getOpportunity(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.businessService.getOpportunity(id);
  }

  @Post('opportunities')
  async createOpportunity(
    @Body() opportunityData: any,
  ): Promise<ApiResponse<any>> {
    return this.businessService.createOpportunity(opportunityData);
  }

  @Get('habits')
  async getBusinessHabits(): Promise<ApiResponse<any[]>> {
    return this.businessService.getBusinessHabits();
  }

  @Get('projects')
  async getProjects(): Promise<ApiResponse<any[]>> {
    return this.businessService.getProjects();
  }

  @Get('projects/:id')
  async getProject(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.businessService.getProject(id);
  }

  @Post('projects')
  async createProject(@Body() projectData: any): Promise<ApiResponse<any>> {
    return this.businessService.createProject(projectData);
  }

  @Put('projects/:id/progress')
  async updateProjectProgress(
    @Param('id') id: string,
    @Body() progressData: { progress: number },
  ): Promise<ApiResponse<any>> {
    return this.businessService.updateProjectProgress(
      id,
      progressData.progress,
    );
  }

  @Get('analytics')
  async getBusinessAnalytics(): Promise<ApiResponse<any>> {
    return this.businessService.getBusinessAnalytics();
  }
}
