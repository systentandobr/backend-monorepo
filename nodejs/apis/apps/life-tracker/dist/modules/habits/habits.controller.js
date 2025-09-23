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
exports.HabitsController = void 0;
const common_1 = require("@nestjs/common");
const habits_service_1 = require("./habits.service");
const types_1 = require("../../types");
let HabitsController = class HabitsController {
    habitsService;
    constructor(habitsService) {
        this.habitsService = habitsService;
    }
    async getAllHabits() {
        return this.habitsService.getAllHabits();
    }
    async getCategories() {
        return this.habitsService.getCategories();
    }
    async getHabitsByDomain(domain) {
        return this.habitsService.getHabitsByDomain(domain);
    }
    async getHabitsByCategory(categoryId) {
        return this.habitsService.getHabitsByCategory(categoryId);
    }
    async getHabitsWithFilters(timeOfDay, categoryId, completed) {
        return this.habitsService.getHabitsWithFilters({ timeOfDay, categoryId, completed });
    }
    async createHabit(createHabitDto) {
        return this.habitsService.createHabit(createHabitDto);
    }
    async updateHabit(id, updateHabitDto) {
        return this.habitsService.updateHabit(id, updateHabitDto);
    }
    async deleteHabit(id) {
        return this.habitsService.deleteHabit(id);
    }
    async toggleHabit(id) {
        return this.habitsService.toggleHabit(id);
    }
    async getHabitsStats() {
        return this.habitsService.getHabitsStats();
    }
};
exports.HabitsController = HabitsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HabitsController.prototype, "getAllHabits", null);
__decorate([
    (0, common_1.Get)("categories"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HabitsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)("domain/:domain"),
    __param(0, (0, common_1.Param)("domain")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HabitsController.prototype, "getHabitsByDomain", null);
__decorate([
    (0, common_1.Get)("categories/:categoryId"),
    __param(0, (0, common_1.Param)("categoryId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HabitsController.prototype, "getHabitsByCategory", null);
__decorate([
    (0, common_1.Get)("filters"),
    __param(0, (0, common_1.Query)("timeOfDay")),
    __param(1, (0, common_1.Query)("categoryId")),
    __param(2, (0, common_1.Query)("completed")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Boolean]),
    __metadata("design:returntype", Promise)
], HabitsController.prototype, "getHabitsWithFilters", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [types_1.CreateHabitDto]),
    __metadata("design:returntype", Promise)
], HabitsController.prototype, "createHabit", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, types_1.UpdateHabitDto]),
    __metadata("design:returntype", Promise)
], HabitsController.prototype, "updateHabit", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HabitsController.prototype, "deleteHabit", null);
__decorate([
    (0, common_1.Post)(":id/toggle"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HabitsController.prototype, "toggleHabit", null);
__decorate([
    (0, common_1.Get)("stats"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HabitsController.prototype, "getHabitsStats", null);
exports.HabitsController = HabitsController = __decorate([
    (0, common_1.Controller)("habits"),
    __metadata("design:paramtypes", [habits_service_1.HabitsService])
], HabitsController);
//# sourceMappingURL=habits.controller.js.map