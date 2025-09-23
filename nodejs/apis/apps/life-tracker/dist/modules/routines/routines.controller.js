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
exports.RoutinesController = void 0;
const common_1 = require("@nestjs/common");
const routines_service_1 = require("./routines.service");
const types_1 = require("../../types");
let RoutinesController = class RoutinesController {
    routinesService;
    constructor(routinesService) {
        this.routinesService = routinesService;
    }
    async getIntegratedPlan() {
        return this.routinesService.getIntegratedPlan();
    }
    async getHabitsByDomain(domain) {
        return this.routinesService.getHabitsByDomain(domain);
    }
    async getIntegratedGoals() {
        return this.routinesService.getIntegratedGoals();
    }
    async createHabit(createHabitDto) {
        return this.routinesService.createHabit(createHabitDto);
    }
    async updateHabit(id, updateHabitDto) {
        return this.routinesService.updateHabit(id, updateHabitDto);
    }
    async completeHabit(completeHabitDto) {
        return this.routinesService.completeHabit(completeHabitDto);
    }
    async updateIntegratedGoalProgress(id, body) {
        return this.routinesService.updateIntegratedGoalProgress(id, body.progress);
    }
};
exports.RoutinesController = RoutinesController;
__decorate([
    (0, common_1.Get)('integrated-plan'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoutinesController.prototype, "getIntegratedPlan", null);
__decorate([
    (0, common_1.Get)('habits/:domain'),
    __param(0, (0, common_1.Param)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoutinesController.prototype, "getHabitsByDomain", null);
__decorate([
    (0, common_1.Get)('integrated-goals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoutinesController.prototype, "getIntegratedGoals", null);
__decorate([
    (0, common_1.Post)('habits'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.CreateHabitDto]),
    __metadata("design:returntype", Promise)
], RoutinesController.prototype, "createHabit", null);
__decorate([
    (0, common_1.Put)('habits/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, types_1.UpdateHabitDto]),
    __metadata("design:returntype", Promise)
], RoutinesController.prototype, "updateHabit", null);
__decorate([
    (0, common_1.Post)('habits/complete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.CompleteHabitDto]),
    __metadata("design:returntype", Promise)
], RoutinesController.prototype, "completeHabit", null);
__decorate([
    (0, common_1.Put)('integrated-goals/:id/progress'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoutinesController.prototype, "updateIntegratedGoalProgress", null);
exports.RoutinesController = RoutinesController = __decorate([
    (0, common_1.Controller)('routines'),
    __metadata("design:paramtypes", [routines_service_1.RoutinesService])
], RoutinesController);
//# sourceMappingURL=routines.controller.js.map