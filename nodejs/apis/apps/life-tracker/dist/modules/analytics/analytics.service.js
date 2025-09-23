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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const analytics_data_schema_1 = require("./schemas/analytics-data.schema");
let AnalyticsService = class AnalyticsService {
    analyticsDataModel;
    constructor(analyticsDataModel) {
        this.analyticsDataModel = analyticsDataModel;
    }
    async getAnalyticsData() {
        try {
            const analyticsData = await this.analyticsDataModel.findOne().exec();
            return {
                success: true,
                data: analyticsData || {},
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar dados de analytics',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getCrossDomainAnalytics() {
        try {
            return {
                success: true,
                data: {
                    cross_domain_progress: {
                        healthness: 80,
                        finances: 65,
                        business: 45,
                        productivity: 70,
                    },
                    correlations: [],
                    insights: [],
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar analytics cross-domain',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getPerformanceMetrics() {
        try {
            return {
                success: true,
                data: {
                    response_time: 150,
                    throughput: 1000,
                    error_rate: 0.01,
                    uptime: 99.9,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar métricas de performance',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async trackEvent(eventData) {
        try {
            const analyticsEvent = new this.analyticsDataModel({
                ...eventData,
                timestamp: new Date().toISOString(),
            });
            const savedEvent = await analyticsEvent.save();
            return {
                success: true,
                data: savedEvent,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao rastrear evento',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async markActivity(activityData) {
        try {
            const { activityType, completed } = activityData;
            const analyticsActivity = new this.analyticsDataModel({
                activityType,
                completed,
                timestamp: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            return {
                success: true,
                data: {
                    activityType,
                    completed,
                    timestamp: new Date().toISOString(),
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao marcar atividade',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async updateRoutine(id, routineData) {
        try {
            const analyticsRoutine = new this.analyticsDataModel({
                id,
                ...routineData,
                updatedAt: new Date().toISOString(),
            });
            return {
                success: true,
                data: {
                    id,
                    ...routineData,
                    ...analyticsRoutine,
                    updatedAt: new Date().toISOString(),
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao atualizar rotina',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async deleteRoutine(id) {
        try {
            const analyticsRoutine = await this.analyticsDataModel.findByIdAndDelete(id);
            if (!analyticsRoutine) {
                return {
                    success: false,
                    error: 'Rotina não encontrada para ser removida',
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: {
                    id,
                    deleted: true,
                    timestamp: new Date().toISOString(),
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao deletar rotina',
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(analytics_data_schema_1.AnalyticsData.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map