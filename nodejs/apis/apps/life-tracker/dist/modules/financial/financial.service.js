"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const portfolio_schema_1 = require("./schemas/portfolio.schema");
const asset_schema_1 = require("./schemas/asset.schema");
const financial_goal_schema_1 = require("./schemas/financial-goal.schema");
let FinancialService = class FinancialService {
    portfolioModel;
    assetModel;
    financialGoalModel;
    constructor(portfolioModel, assetModel, financialGoalModel) {
        this.portfolioModel = portfolioModel;
        this.assetModel = assetModel;
        this.financialGoalModel = financialGoalModel;
    }
    async getPortfolio() {
        try {
            const portfolio = await this.portfolioModel.findOne().exec();
            return {
                success: true,
                data: portfolio || {},
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar portfólio',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getPortfolioSummary() {
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
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar resumo do portfólio',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getAssets() {
        try {
            const assets = await this.assetModel.find().exec();
            return {
                success: true,
                data: assets,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar ativos',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getAsset(id) {
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
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar ativo',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getFinancialGoals() {
        try {
            const goals = await this.financialGoalModel.find().exec();
            return {
                success: true,
                data: goals,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar metas financeiras',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getFinancialGoal(id) {
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
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar meta financeira',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async createFinancialGoal(goalData) {
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
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao criar meta financeira',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async updateFinancialGoal(id, goalData) {
        try {
            const goal = await this.financialGoalModel.findByIdAndUpdate(id, {
                ...goalData,
                updatedAt: new Date().toISOString(),
            }, { new: true }).exec();
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
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao atualizar meta financeira',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getPortfolioRiskAnalysis() {
        try {
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
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao calcular análise de risco',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getFinancialAnalytics() {
        try {
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
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar analytics financeiros',
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(portfolio_schema_1.Portfolio.name)),
    __param(1, (0, mongoose_1.InjectModel)(asset_schema_1.Asset.name)),
    __param(2, (0, mongoose_1.InjectModel)(financial_goal_schema_1.FinancialGoal.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], FinancialService);
//# sourceMappingURL=financial.service.js.map