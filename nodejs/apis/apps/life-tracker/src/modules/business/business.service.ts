import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import { BusinessOpportunity } from './schemas/business-opportunity.schema';
import { BusinessProject } from './schemas/business-project.schema';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(BusinessOpportunity.name) private opportunityModel: Model<BusinessOpportunity>,
    @InjectModel(BusinessProject.name) private projectModel: Model<BusinessProject>,
  ) {}

  async getOpportunities(): Promise<ApiResponse<any[]>> {
    try {
      const opportunities = await this.opportunityModel.find().exec();
      
      return {
        success: true,
        data: opportunities,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar oportunidades',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getOpportunity(id: string): Promise<ApiResponse<any>> {
    try {
      const opportunity = await this.opportunityModel.findById(id).exec();
      
      if (!opportunity) {
        return {
          success: false,
          error: 'Oportunidade não encontrada',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: opportunity,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar oportunidade',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async createOpportunity(opportunityData: any): Promise<ApiResponse<any>> {
    try {
      const opportunity = new this.opportunityModel({
        ...opportunityData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const savedOpportunity = await opportunity.save();

      return {
        success: true,
        data: savedOpportunity,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao criar oportunidade',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getProjects(): Promise<ApiResponse<any[]>> {
    try {
      const projects = await this.projectModel.find().exec();
      
      return {
        success: true,
        data: projects,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar projetos',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getProject(id: string): Promise<ApiResponse<any>> {
    try {
      const project = await this.projectModel.findById(id).exec();
      
      if (!project) {
        return {
          success: false,
          error: 'Projeto não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: project,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar projeto',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async createProject(projectData: any): Promise<ApiResponse<any>> {
    try {
      const project = new this.projectModel({
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const savedProject = await project.save();

      return {
        success: true,
        data: savedProject,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao criar projeto',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateProjectProgress(id: string, progress: number): Promise<ApiResponse<any>> {
    try {
      const project = await this.projectModel.findByIdAndUpdate(
        id,
        {
          progress,
          updatedAt: new Date().toISOString(),
        },
        { new: true }
      ).exec();

      if (!project) {
        return {
          success: false,
          error: 'Projeto não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: project,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao atualizar progresso do projeto',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getBusinessAnalytics(): Promise<ApiResponse<any>> {
    try {
      const opportunities = await this.opportunityModel.find().exec();
      const projects = await this.projectModel.find().exec();
      
      const totalOpportunities = opportunities.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const avgProjectProgress = projects.reduce((acc, p) => acc + p.progress, 0) / projects.length || 0;

      return {
        success: true,
        data: {
          total_opportunities: totalOpportunities,
          active_projects: activeProjects,
          average_project_progress: avgProjectProgress,
          total_investment_potential: opportunities.reduce((acc, o) => acc + o.investment, 0),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar analytics de negócios',
        timestamp: new Date().toISOString(),
      };
    }
  }
} 