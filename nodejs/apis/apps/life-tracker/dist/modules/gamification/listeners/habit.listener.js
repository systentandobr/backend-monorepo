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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabitListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const gamification_service_1 = require("../gamification.service");
let HabitListener = class HabitListener {
    gamificationService;
    constructor(gamificationService) {
        this.gamificationService = gamificationService;
    }
    async handleHabitCompletedEvent(payload) {
        try {
            const { userId, habitId, difficulty = 'medium', habitName = 'Hábito' } = payload;
            const points = this.calculatePoints('HABIT_COMPLETION', difficulty);
            const result = await this.gamificationService.addPoints(userId, points, 'HABIT_COMPLETION', habitId, `Completou o hábito: ${habitName}`);
            if (result.success) {
                console.log(`Pontos adicionados para usuário ${userId}: +${points} pontos`);
                if (result.data.newAchievements && result.data.newAchievements.length > 0) {
                    console.log(`Novas conquistas desbloqueadas para usuário ${userId}:`, result.data.newAchievements.map(a => a.name));
                }
            }
            else {
                console.error(`Erro ao adicionar pontos para usuário ${userId}:`, result.error);
            }
        }
        catch (error) {
            console.error('Erro no HabitListener:', error);
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
        const multiplier = difficultyMultiplier[difficulty];
        return Math.floor(base * multiplier);
    }
};
exports.HabitListener = HabitListener;
__decorate([
    (0, event_emitter_1.OnEvent)('habit.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HabitListener.prototype, "handleHabitCompletedEvent", null);
exports.HabitListener = HabitListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gamification_service_1.GamificationService])
], HabitListener);
//# sourceMappingURL=habit.listener.js.map