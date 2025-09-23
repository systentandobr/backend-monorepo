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
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const health_plan_schema_1 = require("./schemas/health-plan.schema");
const latest_labs_schema_1 = require("./schemas/latest-labs.schema");
const diet_parameters_schema_1 = require("./schemas/diet-parameters.schema");
const recipe_schema_1 = require("./schemas/recipe.schema");
let HealthService = class HealthService {
    healthPlanModel;
    latestLabsModel;
    dietParametersModel;
    recipeModel;
    constructor(healthPlanModel, latestLabsModel, dietParametersModel, recipeModel) {
        this.healthPlanModel = healthPlanModel;
        this.latestLabsModel = latestLabsModel;
        this.dietParametersModel = dietParametersModel;
        this.recipeModel = recipeModel;
    }
    async loadHealthPlan() {
        try {
            const healthPlan = await this.healthPlanModel.findOne().exec();
            return {
                success: true,
                data: healthPlan || {},
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar plano de saúde',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async updateHealthProgress(progressData) {
        try {
            return {
                success: true,
                data: { message: 'Progresso atualizado com sucesso' },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao atualizar progresso',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async markMeal(mealData) {
        try {
            return {
                success: true,
                data: { message: 'Refeição marcada com sucesso' },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao marcar refeição',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getLatestLabs() {
        try {
            const labs = await this.latestLabsModel.findOne().exec();
            return {
                success: true,
                data: labs || {},
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar exames',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getDietParameters() {
        try {
            const dietParams = await this.dietParametersModel.findOne().exec();
            return {
                success: true,
                data: dietParams || {},
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar parâmetros dietéticos',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getRecipes() {
        try {
            const recipes = await this.recipeModel.find().exec();
            return {
                success: true,
                data: recipes,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar receitas',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getRecipe(id) {
        try {
            const recipe = await this.recipeModel.findById(id).exec();
            if (!recipe) {
                return {
                    success: false,
                    error: 'Receita não encontrada',
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: recipe,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar receita',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getSupplementation() {
        try {
            return {
                success: true,
                data: [],
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar suplementação',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getShoppingList() {
        try {
            return {
                success: true,
                data: {},
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar lista de compras',
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(health_plan_schema_1.HealthPlan.name)),
    __param(1, (0, mongoose_1.InjectModel)(latest_labs_schema_1.LatestLabs.name)),
    __param(2, (0, mongoose_1.InjectModel)(diet_parameters_schema_1.DietParameters.name)),
    __param(3, (0, mongoose_1.InjectModel)(recipe_schema_1.Recipe.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], HealthService);
//# sourceMappingURL=health.service.js.map