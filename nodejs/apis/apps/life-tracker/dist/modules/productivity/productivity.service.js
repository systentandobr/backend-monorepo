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
exports.ProductivityService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const productivity_goal_schema_1 = require("./schemas/productivity-goal.schema");
let ProductivityService = class ProductivityService {
    productivityGoalModel;
    constructor(productivityGoalModel) {
        this.productivityGoalModel = productivityGoalModel;
    }
    async getProductivityGoals() {
        try {
            const goals = await this.productivityGoalModel.find().exec();
            return {
                success: true,
                data: goals,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar metas de produtividade',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getProductivityGoal(id) {
        try {
            const goal = await this.productivityGoalModel.findById(id).exec();
            if (!goal) {
                return {
                    success: false,
                    error: 'Meta de produtividade não encontrada',
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
                error: 'Erro ao carregar meta de produtividade',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async createProductivityGoal(goalData) {
        try {
            const goal = new this.productivityGoalModel({
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
                error: 'Erro ao criar meta de produtividade',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async updateGoalProgress(id, progress) {
        try {
            const goal = await this.productivityGoalModel.findByIdAndUpdate(id, {
                progress,
                updatedAt: new Date().toISOString(),
            }, { new: true }).exec();
            if (!goal) {
                return {
                    success: false,
                    error: 'Meta de produtividade não encontrada',
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
                error: 'Erro ao atualizar progresso da meta',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getProductivityAnalytics() {
        try {
            const goals = await this.productivityGoalModel.find().exec();
            const totalGoals = goals.length;
            const completedGoals = goals.filter(g => g.progress === 100).length;
            const avgProgress = goals.reduce((acc, g) => acc + g.progress, 0) / goals.length || 0;
            return {
                success: true,
                data: {
                    total_goals: totalGoals,
                    completed_goals: completedGoals,
                    average_progress: avgProgress,
                    completion_rate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar analytics de produtividade',
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.ProductivityService = ProductivityService;
exports.ProductivityService = ProductivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(productivity_goal_schema_1.ProductivityGoal.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductivityService);
//# sourceMappingURL=productivity.service.js.map