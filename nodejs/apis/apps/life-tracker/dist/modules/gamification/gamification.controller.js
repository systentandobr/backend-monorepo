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
exports.GamificationController = void 0;
const common_1 = require("@nestjs/common");
const gamification_service_1 = require("./gamification.service");
let GamificationController = class GamificationController {
    gamificationService;
    constructor(gamificationService) {
        this.gamificationService = gamificationService;
    }
    async getProfile(userId) {
        if (!userId) {
            return {
                success: false,
                error: 'userId é obrigatório',
                timestamp: new Date().toISOString(),
            };
        }
        return this.gamificationService.getProfile(userId);
    }
    async getAchievements(userId) {
        if (!userId) {
            return {
                success: false,
                error: 'userId é obrigatório',
                timestamp: new Date().toISOString(),
            };
        }
        return this.gamificationService.getAchievements(userId);
    }
    async getLeaderboard(period = 'all') {
        return this.gamificationService.getLeaderboard(period);
    }
    async addPoints(transactionData) {
        const { userId, points, sourceType, sourceId, description } = transactionData;
        if (!userId || !points || !sourceType || !sourceId || !description) {
            return {
                success: false,
                error: 'Todos os campos são obrigatórios',
                timestamp: new Date().toISOString(),
            };
        }
        return this.gamificationService.addPoints(userId, points, sourceType, sourceId, description);
    }
    async initializeDefaultAchievements() {
        return this.gamificationService.initializeDefaultAchievements();
    }
};
exports.GamificationController = GamificationController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('achievements'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getAchievements", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Post)('transaction'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "addPoints", null);
__decorate([
    (0, common_1.Post)('initialize-achievements'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GamificationController.prototype, "initializeDefaultAchievements", null);
exports.GamificationController = GamificationController = __decorate([
    (0, common_1.Controller)('gamification'),
    __metadata("design:paramtypes", [gamification_service_1.GamificationService])
], GamificationController);
//# sourceMappingURL=gamification.controller.js.map