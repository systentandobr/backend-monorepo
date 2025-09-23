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
exports.AchievementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const achievement_schema_1 = require("./schemas/achievement.schema");
const user_achievement_schema_1 = require("./schemas/user-achievement.schema");
const gamification_profile_schema_1 = require("./schemas/gamification-profile.schema");
let AchievementService = class AchievementService {
    achievementModel;
    userAchievementModel;
    gamificationProfileModel;
    constructor(achievementModel, userAchievementModel, gamificationProfileModel) {
        this.achievementModel = achievementModel;
        this.userAchievementModel = userAchievementModel;
        this.gamificationProfileModel = gamificationProfileModel;
    }
    async getAllAchievements() {
        try {
            const achievements = await this.achievementModel.find().exec();
            return {
                success: true,
                data: achievements,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Erro ao buscar conquistas: ${error.message}`,
            };
        }
    }
    async getUserAchievements(userId) {
        try {
            const achievements = await this.achievementModel.find().exec();
            const userAchievements = await this.userAchievementModel.find({ userId }).exec();
            const userAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
            const achievementsWithStatus = achievements.map(achievement => ({
                ...achievement.toObject(),
                unlocked: userAchievementIds.has(achievement.achievementId),
                unlockedAt: userAchievements.find(ua => ua.achievementId === achievement.achievementId)?.unlockedAt,
            }));
            const unlockedCount = achievementsWithStatus.filter(a => a.unlocked).length;
            const totalCount = achievements.length;
            return {
                success: true,
                data: {
                    achievements: achievementsWithStatus,
                    unlockedCount,
                    totalCount,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Erro ao buscar conquistas do usuário: ${error.message}`,
            };
        }
    }
    async checkAndUnlockAchievements(userId, userStats) {
        try {
            const achievements = await this.achievementModel.find().exec();
            const userAchievements = await this.userAchievementModel.find({ userId }).exec();
            const userAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
            const newlyUnlocked = [];
            for (const achievement of achievements) {
                if (userAchievementIds.has(achievement.achievementId)) {
                    continue;
                }
                const shouldUnlock = this.checkAchievementCriteria(achievement.criteria, userStats);
                if (shouldUnlock) {
                    const userAchievement = new this.userAchievementModel({
                        userId,
                        achievementId: achievement.achievementId,
                        unlockedAt: new Date(),
                    });
                    await userAchievement.save();
                    newlyUnlocked.push(achievement);
                }
            }
            return {
                success: true,
                data: newlyUnlocked,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Erro ao verificar conquistas: ${error.message}`,
            };
        }
    }
    checkAchievementCriteria(criteria, userStats) {
        const { criteriaType, value } = criteria;
        switch (criteriaType) {
            case 'POINTS':
                return userStats.totalPoints >= value;
            case 'STREAK':
                return userStats.streak >= value;
            case 'HABIT_COUNT':
                return userStats.habitsCompleted >= value;
            case 'ROUTINE_COUNT':
                return userStats.routinesCompleted >= value;
            default:
                return false;
        }
    }
    async createDefaultAchievements() {
        try {
            const defaultAchievements = [
                {
                    achievementId: 'first_habit',
                    name: 'Primeiro Hábito',
                    description: 'Complete seu primeiro hábito',
                    icon: 'star',
                    criteria: { type: 'HABIT_COUNT', value: 1 },
                },
                {
                    achievementId: 'streak_7',
                    name: 'Série de 7 Dias',
                    description: 'Complete um hábito por 7 dias seguidos',
                    icon: 'flame',
                    criteria: { type: 'STREAK', value: 7 },
                },
                {
                    achievementId: 'points_1000',
                    name: 'Mil Pontos',
                    description: 'Acumule 1000 pontos',
                    icon: 'trophy',
                    criteria: { type: 'POINTS', value: 1000 },
                },
                {
                    achievementId: 'routine_master',
                    name: 'Mestre das Rotinas',
                    description: 'Complete 10 rotinas',
                    icon: 'check-circle',
                    criteria: { type: 'ROUTINE_COUNT', value: 10 },
                },
                {
                    achievementId: 'habit_master',
                    name: 'Mestre dos Hábitos',
                    description: 'Complete 50 hábitos',
                    icon: 'target',
                    criteria: { type: 'HABIT_COUNT', value: 50 },
                },
            ];
            const createdAchievements = [];
            for (const achievementData of defaultAchievements) {
                const existingAchievement = await this.achievementModel
                    .findOne({ achievementId: achievementData.achievementId })
                    .exec();
                if (!existingAchievement) {
                    const achievement = new this.achievementModel(achievementData);
                    await achievement.save();
                    createdAchievements.push(achievement);
                }
            }
            return {
                success: true,
                data: createdAchievements,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Erro ao criar conquistas padrão: ${error.message}`,
            };
        }
    }
};
exports.AchievementService = AchievementService;
exports.AchievementService = AchievementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(achievement_schema_1.Achievement.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_achievement_schema_1.UserAchievement.name)),
    __param(2, (0, mongoose_1.InjectModel)(gamification_profile_schema_1.GamificationProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AchievementService);
//# sourceMappingURL=achievement.service.js.map