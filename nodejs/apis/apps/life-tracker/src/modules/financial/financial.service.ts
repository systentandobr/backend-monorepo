import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import { Portfolio } from './schemas/portfolio.schema';
import { Asset } from './schemas/asset.schema';
import { FinancialGoal } from './schemas/financial-goal.schema';

@Injectable()
export class FinancialService {
  constructor(
    @InjectModel(Portfolio.name) private portfolioModel: Model<Portfolio>,
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
    @InjectModel(FinancialGoal.name) private financialGoalModel: Model<FinancialGoal>,
  ) {}

  async getPortfolio(): Promise<ApiResponse<any>> {
    try {
      const portfolio = await this.portfolioModel.findOne().exec();
      
      return {
        success: true,
        data: portfolio || {},
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar portfólio',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getPortfolioSummary(): Promise<ApiResponse<any>> {
    try {
      const portfolio = await this.portfolioModel.findOne().exec();
      
      return {
        success: true,
        data: {
          total_value: portfolio?.total_value || 0,
          total_return: portfolio?.total_return || 0,
          assets_count: portfolio?.assets?.length || 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar resumo do portfólio',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getAssets(): Promise<ApiResponse<any[]>> {
    try {
      const assets = await this.assetModel.find().exec();
      
      return {
        success: true,
        data: assets,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar ativos',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getAsset(id: string): Promise<ApiResponse<any>> {
    try {
      const asset = await this.assetModel.findById(id).exec();
      
      if (!asset) {
        return {
          success: false,
          error: 'Ativo não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: asset,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar ativo',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getFinancialGoals(): Promise<ApiResponse<any[]>> {
    try {
      const goals = await this.financialGoalModel.find().exec();
      
      return {
        success: true,
        data: goals,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar metas financeiras',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getFinancialGoal(id: string): Promise<ApiResponse<any>> {
    try {
      const goal = await this.financialGoalModel.findById(id).exec();
      
      if (!goal) {
        return {
          success: false,
          error: 'Meta financeira não encontrada',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: goal,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar meta financeira',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async createFinancialGoal(goalData: any): Promise<ApiResponse<any>> {
    try {
      const goal = new this.financialGoalModel({
        ...goalData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const savedGoal = await goal.save();

      return {
        success: true,
        data: savedGoal,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao criar meta financeira',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateFinancialGoal(id: string, goalData: any): Promise<ApiResponse<any>> {
    try {
      const goal = await this.financialGoalModel.findByIdAndUpdate(
        id,
        {
          ...goalData,
          updatedAt: new Date().toISOString(),
        },
        { new: true }
      ).exec();

      if (!goal) {
        return {
          success: false,
          error: 'Meta financeira não encontrada',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: goal,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao atualizar meta financeira',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getFinancialAnalytics(): Promise<ApiResponse<any>> {
    try {
      // Implementação para analytics financeiros
      return {
        success: true,
        data: {
          total_invested: 0,
          total_return_percentage: 0,
          monthly_growth: 0,
          risk_score: 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao carregar analytics financeiros',
        timestamp: new Date().toISOString(),
      };
    }
  }
} 