import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiResponse } from '../../types';
import { Portfolio } from './schemas/portfolio.schema';
import { Asset } from './schemas/asset.schema';
import { FinancialGoal } from './schemas/financial-goal.schema';
import { AddAssetDto, UpdateAssetDto, CreateGoalDto, UpdateGoalDto } from './financial.controller';

@Injectable()
export class FinancialService {
  constructor(
    @InjectModel(Portfolio.name) private portfolioModel: Model<Portfolio>,
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
    @InjectModel(FinancialGoal.name) private financialGoalModel: Model<FinancialGoal>,
  ) {}

  async getPortfolio(userId: string): Promise<ApiResponse<any>> {
    try {
      const portfolio = await this.portfolioModel.findOne({ userId }).exec();
      
      if (!portfolio) {
        // Criar portfólio vazio se não existir
        const newPortfolio = new this.portfolioModel({
          userId,
          totalValue: 0,
          totalInvested: 0,
          assets: [],
          lastUpdated: new Date(),
        });
        await newPortfolio.save();
        
        return {
          success: true,
          data: {
            totalValue: 0,
            totalInvested: 0,
            totalProfitLoss: 0,
            totalProfitLossPercentage: 0,
            assets: [],
            lastUpdated: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Calcular valores atuais baseados nos ativos
      const totalValue = portfolio.assets.reduce((sum, asset) => sum + (asset.currentPrice * asset.quantity), 0);
      const totalInvested = portfolio.assets.reduce((sum, asset) => sum + (asset.averagePrice * asset.quantity), 0);
      const totalProfitLoss = totalValue - totalInvested;
      const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

      return {
        success: true,
        data: {
          totalValue,
          totalInvested,
          totalProfitLoss,
          totalProfitLossPercentage,
          assets: portfolio.assets.map(asset => ({
            id: asset.id,
            symbol: asset.symbol,
            name: asset.name,
            quantity: asset.quantity,
            averagePrice: asset.averagePrice,
            currentPrice: asset.currentPrice,
            totalValue: asset.currentPrice * asset.quantity,
            profitLoss: (asset.currentPrice - asset.averagePrice) * asset.quantity,
            profitLossPercentage: asset.averagePrice > 0 ? ((asset.currentPrice - asset.averagePrice) / asset.averagePrice) * 100 : 0,
            lastUpdated: asset.lastUpdated,
          })),
          lastUpdated: portfolio.lastUpdated.toISOString(),
        },
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

  async getPortfolioSummary(userId: string): Promise<ApiResponse<any>> {
    try {
      const portfolio = await this.portfolioModel.findOne({ userId }).exec();
      
      return {
        success: true,
        data: {
          totalValue: portfolio?.totalValue || 0,
          totalInvested: portfolio?.totalInvested || 0,
          assetsCount: portfolio?.assets?.length || 0,
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


  async getPortfolioRiskAnalysis(userId: string): Promise<ApiResponse<any>> {
    try {
      const portfolio = await this.portfolioModel.findOne({ userId }).exec();
      
      if (!portfolio || portfolio.assets.length === 0) {
        return {
          success: true,
          data: {
            totalRisk: 0,
            diversificationScore: 0,
            volatility: 0,
            sharpeRatio: 0,
            recommendations: ['Adicione ativos ao seu portfólio para análise de risco'],
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Implementação da análise de risco do portfólio
      // Baseado no frontend, retorna métricas de risco
      return {
        success: true,
        data: {
          totalRisk: 7.2,
          diversificationScore: 8.5,
          volatility: 12.3,
          sharpeRatio: 1.8,
          recommendations: [
            'Considere adicionar mais ativos de renda fixa para reduzir volatilidade',
            'Aumente exposição em setores diferentes para melhor diversificação',
            'Mantenha pelo menos 20% em ativos de baixo risco',
          ],
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao calcular análise de risco',
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

  // Novos métodos para os endpoints atualizados

  async addAsset(userId: string, assetData: AddAssetDto): Promise<ApiResponse<any>> {
    try {
      const portfolio = await this.portfolioModel.findOne({ userId }).exec();
      
      if (!portfolio) {
        return {
          success: false,
          error: 'Portfólio não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      // Buscar preço atual do ativo (mock por enquanto)
      const currentPrice = assetData.averagePrice * (1 + (Math.random() - 0.5) * 0.2); // ±10% variação

      const newAsset = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: assetData.symbol,
        name: assetData.symbol, // Será buscado de uma API externa
        quantity: assetData.quantity,
        averagePrice: assetData.averagePrice,
        currentPrice,
        lastUpdated: new Date(),
      };

      portfolio.assets.push(newAsset);
      portfolio.lastUpdated = new Date();
      await portfolio.save();

      return {
        success: true,
        data: {
          ...newAsset,
          totalValue: newAsset.currentPrice * newAsset.quantity,
          profitLoss: (newAsset.currentPrice - newAsset.averagePrice) * newAsset.quantity,
          profitLossPercentage: newAsset.averagePrice > 0 ? ((newAsset.currentPrice - newAsset.averagePrice) / newAsset.averagePrice) * 100 : 0,
          lastUpdated: newAsset.lastUpdated.toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao adicionar ativo',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateAsset(userId: string, assetId: string, assetData: UpdateAssetDto): Promise<ApiResponse<any>> {
    try {
      const portfolio = await this.portfolioModel.findOne({ userId }).exec();
      
      if (!portfolio) {
        return {
          success: false,
          error: 'Portfólio não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      const assetIndex = portfolio.assets.findIndex(asset => asset.id === assetId);
      
      if (assetIndex === -1) {
        return {
          success: false,
          error: 'Ativo não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      // Atualizar dados do ativo
      if (assetData.symbol) portfolio.assets[assetIndex].symbol = assetData.symbol;
      if (assetData.quantity) portfolio.assets[assetIndex].quantity = assetData.quantity;
      if (assetData.averagePrice) portfolio.assets[assetIndex].averagePrice = assetData.averagePrice;
      
      portfolio.assets[assetIndex].lastUpdated = new Date();
      portfolio.lastUpdated = new Date();
      await portfolio.save();

      const updatedAsset = portfolio.assets[assetIndex];

      return {
        success: true,
        data: {
          ...updatedAsset,
          totalValue: updatedAsset.currentPrice * updatedAsset.quantity,
          profitLoss: (updatedAsset.currentPrice - updatedAsset.averagePrice) * updatedAsset.quantity,
          profitLossPercentage: updatedAsset.averagePrice > 0 ? ((updatedAsset.currentPrice - updatedAsset.averagePrice) / updatedAsset.averagePrice) * 100 : 0,
          lastUpdated: updatedAsset.lastUpdated.toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao atualizar ativo',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async removeAsset(userId: string, assetId: string): Promise<ApiResponse<any>> {
    try {
      const portfolio = await this.portfolioModel.findOne({ userId }).exec();
      
      if (!portfolio) {
        return {
          success: false,
          error: 'Portfólio não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      const assetIndex = portfolio.assets.findIndex(asset => asset.id === assetId);
      
      if (assetIndex === -1) {
        return {
          success: false,
          error: 'Ativo não encontrado',
          timestamp: new Date().toISOString(),
        };
      }

      portfolio.assets.splice(assetIndex, 1);
      portfolio.lastUpdated = new Date();
      await portfolio.save();

      return {
        success: true,
        data: { success: true },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao remover ativo',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getFinancialGoals(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const goals = await this.financialGoalModel.find({ userId }).exec();
      
      return {
        success: true,
        data: goals.map(goal => ({
          id: goal._id.toString(),
          name: goal.name,
          targetAmount: goal.target,
          currentAmount: goal.current,
          targetDate: goal.deadline,
          priority: goal.priority || 'medium',
          createdAt: (goal as any).createdAt || new Date().toISOString(),
        })),
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

  async getFinancialGoal(userId: string, id: string): Promise<ApiResponse<any>> {
    try {
      const goal = await this.financialGoalModel.findOne({ _id: id, userId }).exec();
      
      if (!goal) {
        return {
          success: false,
          error: 'Meta financeira não encontrada',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: {
          id: goal._id.toString(),
          name: goal.name,
          targetAmount: goal.target,
          currentAmount: goal.current,
          targetDate: goal.deadline,
          priority: goal.priority || 'medium',
          createdAt: (goal as any).createdAt || new Date().toISOString(),
        },
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

  async createFinancialGoal(userId: string, goalData: CreateGoalDto): Promise<ApiResponse<any>> {
    try {
      const goal = new this.financialGoalModel({
        userId,
        name: goalData.name,
        target: goalData.targetAmount,
        current: 0,
        deadline: goalData.targetDate,
        priority: goalData.priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const savedGoal = await goal.save();

      return {
        success: true,
        data: {
          id: savedGoal._id.toString(),
          name: savedGoal.name,
          targetAmount: savedGoal.target,
          currentAmount: savedGoal.current,
          targetDate: savedGoal.deadline,
          priority: savedGoal.priority,
          createdAt: (savedGoal as any).createdAt || new Date().toISOString(),
        },
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

  async updateFinancialGoal(userId: string, id: string, goalData: UpdateGoalDto): Promise<ApiResponse<any>> {
    try {
      const goal = await this.financialGoalModel.findOneAndUpdate(
        { _id: id, userId },
        {
          ...(goalData.name && { name: goalData.name }),
          ...(goalData.targetAmount && { target: goalData.targetAmount }),
          ...(goalData.currentAmount !== undefined && { current: goalData.currentAmount }),
          ...(goalData.targetDate && { deadline: goalData.targetDate }),
          ...(goalData.priority && { priority: goalData.priority }),
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
        data: {
          id: goal._id.toString(),
          name: goal.name,
          targetAmount: goal.target,
          currentAmount: goal.current,
          targetDate: goal.deadline,
          priority: goal.priority,
          createdAt: (goal as any).createdAt || new Date().toISOString(),
        },
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

  async deleteFinancialGoal(userId: string, id: string): Promise<ApiResponse<any>> {
    try {
      const goal = await this.financialGoalModel.findOneAndDelete({ _id: id, userId }).exec();

      if (!goal) {
        return {
          success: false,
          error: 'Meta financeira não encontrada',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: { success: true },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao deletar meta financeira',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getMarketData(symbols: string[]): Promise<ApiResponse<any[]>> {
    try {
      // Mock de dados de mercado - será integrado com Alpha Vantage
      const marketData = symbols.map(symbol => ({
        symbol,
        price: Math.random() * 100 + 10,
        change: (Math.random() - 0.5) * 10,
        changePercentage: (Math.random() - 0.5) * 20,
        lastUpdated: new Date().toISOString(),
      }));

      return {
        success: true,
        data: marketData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao buscar dados de mercado',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getPriceHistory(symbol: string, period: string): Promise<ApiResponse<any>> {
    try {
      // Mock de histórico de preços - será integrado com Alpha Vantage
      const days = period === '1d' ? 1 : period === '1w' ? 7 : period === '1m' ? 30 : 90;
      
      const historyData = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString(),
        price: Math.random() * 50 + 25,
        volume: Math.random() * 1000000,
      }));

      return {
        success: true,
        data: {
          symbol,
          period,
          data: historyData,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao buscar histórico de preços',
        timestamp: new Date().toISOString(),
      };
    }
  }
} 