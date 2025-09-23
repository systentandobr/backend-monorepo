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
exports.PointsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const gamification_profile_schema_1 = require("./schemas/gamification-profile.schema");
const point_transaction_schema_1 = require("./schemas/point-transaction.schema");
let PointsService = class PointsService {
    gamificationProfileModel;
    pointTransactionModel;
    constructor(gamificationProfileModel, pointTransactionModel) {
        this.gamificationProfileModel = gamificationProfileModel;
        this.pointTransactionModel = pointTransactionModel;
    }
    async addPoints(userId, points, sourceType, sourceId, description) {
        try {
            let profile = await this.gamificationProfileModel.findOne({ userId }).exec();
            if (!profile) {
                profile = new this.gamificationProfileModel({
                    userId,
                    totalPoints: 0,
                    level: 1,
                    pointsToNextLevel: 100,
                });
            }
            profile.totalPoints += points;
            const newLevel = Math.floor(profile.totalPoints / 100) + 1;
            const pointsToNextLevel = (newLevel * 100) - profile.totalPoints;
            profile.level = newLevel;
            profile.pointsToNextLevel = pointsToNextLevel;
            profile.updatedAt = new Date();
            await profile.save();
            const transaction = new this.pointTransactionModel({
                userId,
                points,
                sourceType,
                sourceId,
                description,
            });
            await transaction.save();
            return {
                success: true,
                data: {
                    profile,
                    transaction,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Erro ao adicionar pontos: ${error.message}`,
            };
        }
    }
    calculatePoints(actionType, difficulty) {
        const basePoints = {
            HABIT_COMPLETION: 10,
            ROUTINE_COMPLETION: 25,
        };
        const difficultyMultiplier = {
            easy: 1,
            medium: 1.5,
            hard: 2,
        };
        const base = basePoints[actionType];
        const multiplier = difficulty ? difficultyMultiplier[difficulty] : 1;
        return Math.floor(base * multiplier);
    }
    async getUserTransactions(userId, limit = 10, offset = 0) {
        try {
            const transactions = await this.pointTransactionModel
                .find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(offset)
                .exec();
            return {
                success: true,
                data: transactions,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Erro ao buscar transações: ${error.message}`,
            };
        }
    }
    async getUserPointsStats(userId) {
        try {
            const profile = await this.gamificationProfileModel.findOne({ userId }).exec();
            if (!profile) {
                return {
                    success: true,
                    data: {
                        totalPoints: 0,
                        level: 1,
                        pointsToNextLevel: 100,
                        hasProfile: false,
                    },
                };
            }
            const totalTransactions = await this.pointTransactionModel.countDocuments({ userId });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayTransactions = await this.pointTransactionModel
                .find({
                userId,
                createdAt: { $gte: today },
            })
                .exec();
            const todayPoints = todayTransactions.reduce((sum, transaction) => sum + transaction.points, 0);
            return {
                success: true,
                data: {
                    ...profile.toObject(),
                    hasProfile: true,
                    totalTransactions,
                    todayPoints,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Erro ao buscar estatísticas: ${error.message}`,
            };
        }
    }
};
exports.PointsService = PointsService;
exports.PointsService = PointsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(gamification_profile_schema_1.GamificationProfile.name)),
    __param(1, (0, mongoose_1.InjectModel)(point_transaction_schema_1.PointTransaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], PointsService);
//# sourceMappingURL=points.service.js.map