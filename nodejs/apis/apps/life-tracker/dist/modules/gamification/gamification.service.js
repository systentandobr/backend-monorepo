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
exports.GamificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const gamification_profile_schema_1 = require("./schemas/gamification-profile.schema");
const points_service_1 = require("./points.service");
const achievement_service_1 = require("./achievement.service");
let GamificationService = class GamificationService {
    gamificationProfileModel;
    pointsService;
    achievementService;
    constructor(gamificationProfileModel, pointsService, achievementService) {
        this.gamificationProfileModel = gamificationProfileModel;
        this.pointsService = pointsService;
        this.achievementService = achievementService;
    }
    async getProfile(userId) {
        try {
            const result = await this.pointsService.getUserPointsStats(userId);
            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: result.data,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar perfil de gamificação',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getAchievements(userId) {
        try {
            const result = await this.achievementService.getUserAchievements(userId);
            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                };
            }
            return {
                success: true,
                data: result.data,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar conquistas',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getLeaderboard(period = 'all') {
        try {
            let dateFilter = {};
            if (period !== 'all') {
                const now = new Date();
                let startDate;
                switch (period) {
                    case 'daily':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case 'weekly':
                        startDate = new Date(now);
                        startDate.setDate(now.getDate() - 7);
                        break;
                    case 'monthly':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                }
                dateFilter = { updatedAt: { $gte: startDate } };
            }
            const leaderboard = await this.gamificationProfileModel
                .find(dateFilter)
                .sort({ totalPoints: -1 })
                .limit(50)
                .exec();
            const leaderboardWithPosition = leaderboard.map((profile, index) => ({
                ...profile.toObject(),
                position: index + 1,
            }));
            return {
                success: true,
                data: {
                    entries: leaderboardWithPosition,
                    totalUsers: await this.gamificationProfileModel.countDocuments(),
                    period,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao carregar ranking',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async addPoints(userId, points, sourceType, sourceId, description) {
        try {
            const result = await this.pointsService.addPoints(userId, points, sourceType, sourceId, description);
            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                };
            }
            const profile = result.data.profile;
            const userStats = {
                totalPoints: profile.totalPoints,
                streak: 0,
                habitsCompleted: 0,
                routinesCompleted: 0,
            };
            const achievementsResult = await this.achievementService.checkAndUnlockAchievements(userId, userStats);
            return {
                success: true,
                data: {
                    ...result.data,
                    newAchievements: achievementsResult.data || [],
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao adicionar pontos',
                timestamp: new Date().toISOString(),
            };
        }
    }
    async initializeDefaultAchievements() {
        try {
            const result = await this.achievementService.createDefaultAchievements();
            return {
                success: result.success,
                data: result.data,
                error: result.error,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Erro ao inicializar conquistas padrão',
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(gamification_profile_schema_1.GamificationProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        points_service_1.PointsService,
        achievement_service_1.AchievementService])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map